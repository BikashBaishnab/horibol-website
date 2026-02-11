import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashOtp(otp: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(otp);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function cleanPhone(phone: string): string {
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length === 10) cleaned = '91' + cleaned;
    return cleaned;
}

// ---- WhatsApp OTP ----
async function sendWhatsAppOtp(phone: string, otp: string): Promise<boolean> {
    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN');
    const PHONE_ID = Deno.env.get('WHATSAPP_PHONE_ID');
    const TEMPLATE_NAME = Deno.env.get('TEMPLATE_NAME');
    const TEMPLATE_LANG = Deno.env.get('TEMPLATE_LANG') || 'en_US';

    if (!WHATSAPP_TOKEN || !PHONE_ID || !TEMPLATE_NAME) {
        console.error('WhatsApp credentials not configured');
        return false;
    }

    try {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${PHONE_ID}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: phone,
                    type: 'template',
                    template: {
                        name: TEMPLATE_NAME,
                        language: { code: TEMPLATE_LANG },
                        components: [
                            { type: "body", parameters: [{ type: "text", text: otp }] },
                            { type: "button", sub_type: "url", index: 0, parameters: [{ type: "text", text: otp }] }
                        ]
                    }
                })
            }
        );
        const data = await response.json();
        if (!response.ok) {
            console.error('WhatsApp send failed:', JSON.stringify(data));
            return false;
        }
        console.log('WhatsApp OTP sent to', phone);
        return true;
    } catch (error: any) {
        console.error('WhatsApp error:', error.message);
        return false;
    }
}

// ---- Custom Email OTP via Resend ----
async function sendResendEmail(email: string, otp: string): Promise<boolean> {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured');
        return false;
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Horibol <noreply@mail.horibol.com>',
                to: [email],
                subject: 'Horibol Account Deletion OTP',
                html: `<p>Your 6 digit otp is <strong>${otp}</strong>.</p><p>This code will expire in 10 minutes.</p>`,
            }),
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error('Resend API error:', JSON.stringify(errData));
            return false;
        }
        console.log('Resend OTP sent to', email);
        return true;
    } catch (error: any) {
        console.error('Resend error:', error.message);
        return false;
    }
}

function jsonResponse(body: object, status: number) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const { action, identifier, otp, reason } = await req.json();
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || "";
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // ==================== SEND OTP ====================
        if (action === 'send-otp') {
            if (!identifier) return jsonResponse({ error: 'Email or phone number is required' }, 400);

            const isEmail = identifier.includes('@');
            const cleanIdentifier = isEmail ? identifier.trim().toLowerCase() : cleanPhone(identifier);

            // Check user exists
            const { data: exists, error: existsError } = await supabase.rpc('check_user_exists', {
                p_identifier: cleanIdentifier
            });
            if (existsError) {
                console.error('check_user_exists error:', existsError);
                return jsonResponse({ error: 'Failed to verify account. Please try again.' }, 500);
            }
            if (!exists) {
                return jsonResponse({ error: 'No account found with this email or phone number.' }, 404);
            }

            const otpCode = generateOtp();
            const otpHash = await hashOtp(otpCode);
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

            // Store deletion request
            const { error: insertError } = await supabase
                .from('account_deletion_requests')
                .insert({
                    identifier: cleanIdentifier,
                    reason: reason || null,
                    status: 'pending',
                    otp_hash: otpHash,
                    otp_expires_at: expiresAt,
                });

            if (insertError) {
                console.error('Insert error:', insertError);
                return jsonResponse({ error: 'Failed to create deletion request.' }, 500);
            }

            let sent = false;
            let channel = '';

            if (isEmail) {
                sent = await sendResendEmail(cleanIdentifier, otpCode);
                channel = 'email';
            } else {
                sent = await sendWhatsAppOtp(cleanIdentifier, otpCode);
                channel = 'whatsapp';
            }

            const message = sent
                ? `Verification code has been sent to your ${channel}.`
                : `Failed to send verification code. Please try again later.`;

            return jsonResponse({ success: sent, message, identifier: cleanIdentifier, channel }, sent ? 200 : 500);
        }

        // ==================== VERIFY OTP ====================
        if (action === 'verify-otp') {
            if (!identifier || !otp) return jsonResponse({ error: 'Identifier and OTP are required' }, 400);

            const isEmail = identifier.includes('@');
            const cleanIdentifier = isEmail ? identifier.trim().toLowerCase() : cleanPhone(identifier);

            // Find latest pending request
            const { data: request, error: fetchError } = await supabase
                .from('account_deletion_requests')
                .select('*')
                .eq('identifier', cleanIdentifier)
                .eq('status', 'pending')
                .gte('otp_expires_at', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (fetchError || !request) {
                return jsonResponse({ error: 'No pending request found or code expired. Please request a new code.' }, 400);
            }

            // Unified Verification Logic: Hash the provided OTP and compare with stored hash
            const otpHash = await hashOtp(otp.trim());
            const verified = (request.otp_hash === otpHash);

            if (!verified) {
                return jsonResponse({ error: 'Invalid verification code. Please try again.' }, 400);
            }

            // OTP verified — find and delete user
            const { data: deleteResult, error: deleteError } = await supabase.rpc('process_account_deletion', {
                p_identifier: cleanIdentifier
            });
            if (deleteError) {
                console.error('process_account_deletion error:', deleteError);
                return jsonResponse({ error: 'Failed to process account deletion metadata.' }, 500);
            }

            // Delete auth user — CASCADE will clean up all FK references in public schema
            if (deleteResult?.user_id) {
                const { error: authDeleteError } = await supabase.auth.admin.deleteUser(deleteResult.user_id);
                if (authDeleteError) {
                    console.error('Auth delete error:', authDeleteError);
                    return jsonResponse({ error: 'Failed to delete account. Please contact support.' }, 500);
                }
                console.log('Auth user deleted:', deleteResult.user_id);
            }

            // Mark request completed
            await supabase
                .from('account_deletion_requests')
                .update({ status: 'completed', verified_at: new Date().toISOString() })
                .eq('id', request.id);

            return jsonResponse({
                success: true,
                message: 'Your account and all personal data have been permanently deleted.'
            }, 200);
        }

        return jsonResponse({ error: 'Invalid action. Use "send-otp" or "verify-otp".' }, 400);

    } catch (error: any) {
        console.error('Edge function error:', error.message);
        return jsonResponse({ error: error.message || 'Internal server error' }, 500);
    }
});

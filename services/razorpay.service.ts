/**
 * Razorpay Payment Service
 * 
 * Handles Razorpay Standard Checkout integration with:
 * - Order creation via backend
 * - Native checkout modal
 * - Dashboard-controlled branding
 * - Robust prefill validation
 * - Secure verification via Edge Functions
 */

import { Platform } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

// Config
const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';
const VERIFY_PAYMENT_URL = 'https://wtzefrgqneoycscvlves.supabase.co/functions/v1/verify-razorpay-payment';
const CREATE_ORDER_URL = 'https://wtzefrgqneoycscvlves.supabase.co/functions/v1/create-razorpay-order';

interface PaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface PaymentOptions {
    amount: number;
    receipt: string;
    currency?: string;
    name?: string;
    description?: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    orderId?: string; // Razorpay Order ID
}

export const RazorpayService = {
    /**
     * Create a Razorpay Order through Supabase Edge Function
     */
    createOrder: async (
        amount: number,
        receipt: string,
        authHeader: string,
        extraNotes: Record<string, string> = {}
    ) => {
        try {
            const response = await fetch(CREATE_ORDER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader,
                },
                body: JSON.stringify({
                    amount: Math.round(amount * 100), // convert to paise
                    currency: 'INR',
                    receipt,
                    notes: extraNotes,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create order');
            }

            return await response.json();
        } catch (error) {
            console.error('[Razorpay] Create Order Error:', error);
            throw error;
        }
    },

    /**
     * Open Razorpay Standard Checkout
     */
    openCheckout: async (
        options: PaymentOptions,
        onSuccess: (response: PaymentResponse) => void,
        onError: (error: any) => void
    ) => {
        if (!RAZORPAY_KEY_ID) {
            onError({
                code: 'CONFIG_ERROR',
                message: 'Razorpay Key ID is not configured. Please check your .env file.'
            });
            return;
        }

        const razorpayOptions = {
            key: RAZORPAY_KEY_ID,
            amount: options.amount,
            currency: options.currency || 'INR',
            name: options.name || 'Horibol',
            description: options.description || 'Order Payment',
            // Image and Theme are now FETCHED from your Razorpay Dashboard
            order_id: options.orderId || '',
            prefill: {
                ...(options.prefill?.name ? { name: options.prefill.name } : {}),
                ...(options.prefill?.email ? { email: options.prefill.email } : {}),
                ...(options.prefill?.contact ? { contact: options.prefill.contact } : {}),
            },
            notes: options.notes || {},
            // Use config to hide/readonly prefilled data for a cleaner UI
            config: {
                display: {
                    blocks: {
                        banks: { name: 'Pay using Netbanking', instruments: [{ method: 'netbanking' }] },
                    },
                    sequence: ['block.banks', 'block.other'],
                    preferences: { show_default_blocks: true },
                },
                readonly: {
                    contact: true,
                    email: true,
                    name: true,
                }
            },
            modal: {
                confirm_close: true,
                backdrop_color: '#000000',
            }
        };

        if (Platform.OS === 'web') {
            try {
                // Ensure Razorpay script is loaded
                if (!(window as any).Razorpay) {
                    await new Promise<void>((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                        script.async = true;
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
                        document.body.appendChild(script);
                    });
                }

                const rzp = new (window as any).Razorpay({
                    ...razorpayOptions,
                    handler: (response: PaymentResponse) => {
                        console.log('[Razorpay Web] Success:', response);
                        onSuccess(response);
                    },
                    modal: {
                        ...razorpayOptions.modal,
                        ondismiss: () => {
                            console.log('[Razorpay Web] Dismissed');
                            onError({ code: 'PAYMENT_CANCELLED', message: 'Payment cancelled' });
                        }
                    }
                });

                rzp.open();
            } catch (error: any) {
                console.error('[Razorpay Web] Error:', error);
                onError({
                    code: 'WEB_SDK_ERROR',
                    message: error.message || 'Could not initialize payment gateway',
                    details: error
                });
            }
            return;
        }

        try {
            RazorpayCheckout.open(razorpayOptions)
                .then((data: PaymentResponse) => {
                    console.log('[Razorpay] Success:', data);
                    onSuccess(data);
                })
                .catch((error: any) => {
                    console.log('[Razorpay] Error:', error);
                    let errorMessage = 'Payment cancelled or failed';

                    if (error.description) errorMessage = error.description;
                    else if (typeof error === 'string') errorMessage = error;

                    onError({
                        code: error.code || 'PAYMENT_ERROR',
                        message: errorMessage,
                        details: error.details || error
                    });
                });
        } catch (error: any) {
            console.error('[Razorpay] SDK Error:', error);
            onError({
                code: 'SDK_ERROR',
                message: 'Could not open payment gateway',
                details: error.message || error
            });
        }
    },

    /**
     * Verify payment signature on backend
     */
    verifyPayment: async (
        paymentId: string,
        orderId: string,
        signature: string,
        authHeader: string,
        supabaseOrderId?: string
    ): Promise<boolean> => {
        try {
            const response = await fetch(VERIFY_PAYMENT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader,
                },
                body: JSON.stringify({
                    razorpay_payment_id: paymentId,
                    razorpay_order_id: orderId,
                    razorpay_signature: signature,
                    supabase_order_id: supabaseOrderId,
                }),
            });

            const result = await response.json();
            return result.verified === true;
        } catch (error) {
            console.error('[Razorpay] Verification failed:', error);
            return false;
        }
    },

    /**
     * Quick checkout - combines order creation and checkout opening
     */
    startPayment: async (
        amount: number, // in rupees
        receipt: string,
        customerInfo: {
            name?: string;
            email?: string;
            phone?: string;
        },
        onSuccess: (response: PaymentResponse, orderId: string) => void,
        onError: (error: any) => void,
        authHeader: string,
        supabaseOrderId?: string
    ): Promise<void> => {
        try {
            // 1. Create order
            const order = await RazorpayService.createOrder(amount, receipt, authHeader, {
                supabase_order_id: supabaseOrderId || ''
            });

            if (!order) {
                onError({ code: 'ORDER_FAILED', message: 'Failed to create payment order' });
                return;
            }

            // 2. Open checkout
            await RazorpayService.openCheckout(
                {
                    orderId: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'Horibol',
                    description: `Order #${receipt}`,
                    prefill: {
                        name: customerInfo.name,
                        email: customerInfo.email,
                        contact: customerInfo.phone,
                    },
                    receipt: receipt,
                    notes: {
                        supabase_order_id: supabaseOrderId || ''
                    }
                },
                (response) => {
                    onSuccess(response, order.id);
                },
                onError
            );
        } catch (error) {
            console.error('[Razorpay] Payment failed:', error);
            onError(error);
        }
    },
};

export default RazorpayService;

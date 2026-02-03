declare module 'react-native-razorpay' {
    interface RazorpayOptions {
        key: string;
        amount: number;
        currency?: string;
        name?: string;
        description?: string;
        image?: string;
        order_id: string;
        prefill?: {
            name?: string;
            email?: string;
            contact?: string;
        };
        notes?: Record<string, string>;
        theme?: {
            color?: string;
            backdrop_color?: string;
        };
        modal?: {
            backdropclose?: boolean;
            escape?: boolean;
            handleback?: boolean;
            confirm_close?: boolean;
            ondismiss?: () => void;
            animation?: boolean;
        };
        config?: {
            display?: {
                hide?: string[];
                preferences?: {
                    show_default_blocks?: boolean;
                };
            };
        };
    }

    interface RazorpayResponse {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
    }

    interface RazorpayError {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: {
            order_id: string;
            payment_id: string;
        };
    }

    interface RazorpayCheckoutStatic {
        open(options: RazorpayOptions): Promise<RazorpayResponse>;
    }

    const RazorpayCheckout: RazorpayCheckoutStatic;
    export default RazorpayCheckout;
}

/**
 * Coupon Service
 * 
 * Functions for validating and applying coupons.
 */

import { supabase } from '../lib/supabase';
import type { CouponValidationResult } from '../types';

/**
 * Validate a coupon code
 */
export const validateCoupon = async (
    code: string,
    orderTotal: number
): Promise<CouponValidationResult> => {
    try {
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase())
            .single();

        if (error || !coupon) {
            return { valid: false, error: 'Invalid coupon code' };
        }

        if (!coupon.is_active) {
            return { valid: false, error: 'This coupon is no longer active' };
        }

        // Check dates
        const now = new Date();
        if (coupon.start_date && new Date(coupon.start_date) > now) {
            return { valid: false, error: 'Coupon is not yet active' };
        }
        if (coupon.end_date && new Date(coupon.end_date) < now) {
            return { valid: false, error: 'Coupon has expired' };
        }

        // Check usage limit
        if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
            return { valid: false, error: 'Coupon usage limit reached' };
        }

        // Check min order value
        if (coupon.min_order_value > 0 && orderTotal < coupon.min_order_value) {
            return {
                valid: false,
                error: `Minimum order value of ₹${coupon.min_order_value} required`
            };
        }

        // Check user specific limits (optional, if we want 1 per user)
        // We'd need to check coupon_usage table here.
        // For now, let's assume standard coupons.

        // Calculate discount
        let discount = 0;
        if (coupon.discount_type === 'percentage') {
            discount = (orderTotal * coupon.discount_value) / 100;
            if (coupon.max_discount_amount) {
                discount = Math.min(discount, coupon.max_discount_amount);
            }
        } else {
            discount = coupon.discount_value;
        }

        // Ensure discount doesn't exceed total
        discount = Math.min(discount, orderTotal);

        return {
            valid: true,
            coupon,
            discountAmount: discount
        };
    } catch (error) {
        console.error('Coupon validation error:', error);
        return { valid: false, error: 'Error validating coupon' };
    }
};

/**
 * Record coupon usage (called after successful order)
 */
export const recordCouponUsage = async (
    couponId: number,
    orderId: number,
    discountAmount: number
): Promise<boolean> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('coupon_usage')
            .insert({
                coupon_id: couponId,
                user_id: user.id,
                order_id: orderId,
                discount_amount: discountAmount
            });

        if (error) {
            console.error('Error recording coupon usage:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error recording coupon usage:', error);
        return false;
    }
};

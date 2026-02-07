/**
 * Cart Service
 * 
 * Shopping cart operations.
 */

import { supabase } from '../lib/supabase';
import type { CartItem } from '../types';

/**
 * Check if an item exists in cart
 */
export const checkItemInCart = async (
    productId: number,
    variantId: number | null
): Promise<boolean> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        let query = supabase
            .from('cart')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productId);

        if (variantId) {
            query = query.eq('variant_id', variantId);
        } else {
            query = query.is('variant_id', null);
        }

        const { data, error } = await query.maybeSingle();
        if (error) return false;

        return !!data;
    } catch {
        return false;
    }
};

/**
 * Add item to cart
 */
export const addToCart = async (
    productId: number,
    variantId: number | null
): Promise<boolean> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Please log in to add items.");

        // Check if item already exists to update quantity instead of inserting
        const { data: existing, error: fetchError } = await supabase
            .from('cart')
            .select('id, quantity')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .match(variantId ? { variant_id: variantId } : { variant_id: null })
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (existing) {
            // If exists, increment quantity
            const { error: updateError } = await supabase
                .from('cart')
                .update({ quantity: existing.quantity + 1 })
                .eq('id', existing.id);
            if (updateError) throw updateError;
            return true;
        }

        // Insert new item
        const { error } = await supabase
            .from('cart')
            .insert([{
                user_id: user.id,
                product_id: productId,
                variant_id: variantId,
                quantity: 1
            }]);

        if (error) {
            // Handle race condition if check failed but insertion failed due to unique constraint
            if (error.code === '23505') {
                // Try to update quantity instead
                return addToCart(productId, variantId);
            }
            throw error;
        }
        return true;
    } catch (error) {
        console.error('Add to cart error:', error);
        throw error;
    }
};

/**
 * Get all cart items using cart_view
 */
export const getCartItems = async (): Promise<CartItem[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('cart_view')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching cart:', error);
        return [];
    }

    return data || [];
};

/**
 * Update cart item quantity
 */
export const updateCartQuantity = async (
    cartId: number,
    quantity: number
): Promise<void> => {
    if (quantity < 1) return;

    const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('id', cartId);

    if (error) throw error;
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (cartId: number): Promise<void> => {
    const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartId);

    if (error) throw error;
};

/**
 * Get cart item count for current user
 */
export const getCartCount = async (): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count } = await supabase
        .from('cart')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    return count || 0;
};

/**
 * Clear all items from user's cart
 */
export const clearCart = async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

    if (error) {
        console.error('Error clearing cart:', error);
        throw error;
    }
};

/**
 * Check if COD is valid for the current cart + pincode
 * COD is available ONLY if:
 * 1. ALL products in cart have is_cod = true
 * 2. Shiprocket confirms COD is available for the delivery pincode
 */
export const checkPaymentAvailability = async (
    pincode: string,
    cartItems: any[],
    shiprocketCodAvailable: boolean = false
) => {
    // 1. Check Database (Product) Rules
    // If ANY item in cart has is_cod = false, the whole order is Prepaid Only.
    const hasRestrictedItem = cartItems.some(item => {
        // Check both direct is_cod flag and nested product.is_cod
        const isCod = item.is_cod ?? item.product?.is_cod;
        return isCod === false;
    });

    if (hasRestrictedItem) {
        return {
            codAllowed: false,
            reason: 'One or more items are not eligible for COD.'
        };
    }

    // 2. Check Shiprocket COD Serviceability
    // This flag should come from the serviceability check response
    if (!shiprocketCodAvailable) {
        return {
            codAllowed: false,
            reason: 'COD is not available for your delivery location.'
        };
    }

    // Both conditions satisfied - COD is available
    return { codAllowed: true, reason: '' };
};

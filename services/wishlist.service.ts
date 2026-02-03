/**
 * Wishlist Service
 * 
 * Functions for managing user wishlist.
 */

import { supabase } from '../lib/supabase';

export interface WishlistItem {
    id: number;
    product_id: number;
    variant_id: number | null;
    user_id: string;
    created_at: string;
}

export interface WishlistProduct {
    id: number;
    product_id: number;
    variant_id: number | null;
    product_name: string;
    brand_name: string | null;
    price: number;
    mrp: number;
    discount_percentage: number | null;
    main_image: string | null;
    stock: number;
    attributes?: Record<string, any> | null;
    created_at: string;
}


/**
 * Get user's wishlist with product details
 */
export const getWishlist = async (userId: string): Promise<WishlistProduct[]> => {
    try {
        // First get wishlist items
        const { data: wishlistData, error: wishlistError } = await supabase
            .from('wishlist')
            .select('id, product_id, variant_id, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (wishlistError) {
            console.error('Error fetching wishlist:', wishlistError);
            return [];
        }

        if (!wishlistData || wishlistData.length === 0) {
            return [];
        }

        // Get product/variant details for wishlist items
        // We query product_detail_view for each unique combination or in batch
        const results: WishlistProduct[] = [];

        // Efficient batch fetch using in() if possible, but product_detail_view 
        // usually represents a specific variant if it has variant columns.
        // Let's fetch detail for each item.
        for (const wishlistItem of wishlistData) {
            let query = supabase
                .from('product_detail_view')
                .select('product_id, product_name, brand_name, price, mrp, discount_percentage, main_image, stock, attributes')
                .eq('product_id', wishlistItem.product_id);

            if (wishlistItem.variant_id) {
                query = query.eq('variant_id', wishlistItem.variant_id);
            }

            const { data: productData, error: productError } = await query.maybeSingle();

            if (!productError && productData) {
                results.push({
                    id: wishlistItem.id,
                    product_id: wishlistItem.product_id,
                    variant_id: wishlistItem.variant_id,
                    product_name: productData.product_name || 'Unknown Product',
                    brand_name: productData.brand_name || null,
                    price: productData.price || 0,
                    mrp: productData.mrp || 0,
                    discount_percentage: productData.discount_percentage || null,
                    main_image: productData.main_image || null,
                    stock: productData.stock || 0,
                    attributes: productData.attributes,
                    created_at: wishlistItem.created_at,
                });
            } else {
                // Fallback for items that might have been deleted or missing details
                results.push({
                    id: wishlistItem.id,
                    product_id: wishlistItem.product_id,
                    variant_id: wishlistItem.variant_id,
                    product_name: 'Unknown Product',
                    brand_name: null,
                    price: 0,
                    mrp: 0,
                    discount_percentage: null,
                    main_image: null,
                    stock: 0,
                    created_at: wishlistItem.created_at,
                });
            }
        }

        return results;
    } catch (error) {
        console.error('Unexpected error in getWishlist:', error);
        return [];
    }
};


/**
 * Add product to wishlist
 */
export const addToWishlist = async (userId: string, productId: number, variantId: number | null = null): Promise<boolean> => {
    try {
        // Check if already in wishlist
        let query = supabase
            .from('wishlist')
            .select('id')
            .eq('user_id', userId)
            .eq('product_id', productId);

        if (variantId) {
            query = query.eq('variant_id', variantId);
        } else {
            query = query.is('variant_id', null);
        }

        const { data: existing } = await query.maybeSingle();

        if (existing) {
            return true; // Already in wishlist
        }

        const { error } = await supabase
            .from('wishlist')
            .insert({ user_id: userId, product_id: productId, variant_id: variantId });

        if (error) {
            console.error('Error adding to wishlist:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Unexpected error adding to wishlist:', error);
        return false;
    }
};

/**
 * Remove product from wishlist
 */
export const removeFromWishlist = async (userId: string, productId: number, variantId: number | null = null): Promise<boolean> => {
    try {
        let query = supabase
            .from('wishlist')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);

        if (variantId) {
            query = query.eq('variant_id', variantId);
        } else {
            query = query.is('variant_id', null);
        }

        const { error } = await query;

        if (error) {
            console.error('Error removing from wishlist:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Unexpected error removing from wishlist:', error);
        return false;
    }
};

/**
 * Check if product is in wishlist
 */
export const isInWishlist = async (userId: string, productId: number, variantId: number | null = null): Promise<boolean> => {
    try {
        let query = supabase
            .from('wishlist')
            .select('id')
            .eq('user_id', userId)
            .eq('product_id', productId);

        if (variantId) {
            query = query.eq('variant_id', variantId);
        } else {
            query = query.is('variant_id', null);
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
            console.error('Error checking wishlist:', error);
            return false;
        }

        return !!data;
    } catch (error) {
        console.error('Unexpected error checking wishlist:', error);
        return false;
    }
};

/**
 * Get all wishlist product IDs for user (efficient for batch checking)
 */
export const getWishlistProductIds = async (userId: string): Promise<Set<string>> => {
    try {
        const { data, error } = await supabase
            .from('wishlist')
            .select('product_id, variant_id')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching wishlist IDs:', error);
            return new Set();
        }

        return new Set(data?.map(item => `${item.product_id}-${item.variant_id || 0}`) || []);
    } catch (error) {
        console.error('Unexpected error fetching wishlist IDs:', error);
        return new Set();
    }
};

/**
 * Get wishlist count for user
 */
export const getWishlistCount = async (userId: string): Promise<number> => {
    try {
        const { count, error } = await supabase
            .from('wishlist')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) {
            console.error('Error getting wishlist count:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('Unexpected error getting wishlist count:', error);
        return 0;
    }
};

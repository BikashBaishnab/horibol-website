/**
 * Review Service
 * 
 * Functions for managing product reviews and ratings.
 * Uses the `product_reviews` table in Supabase.
 */

import { supabase } from '../lib/supabase';

export interface Review {
    id: number;
    user_id: string;
    product_id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    user_name?: string;
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}

/**
 * Get reviews for a product
 */
export const getProductReviews = async (productId: number): Promise<Review[]> => {
    try {
        const { data, error } = await supabase
            .from('product_reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) {
            // 42P01 = table doesn't exist - gracefully handle
            if (error.code !== '42P01') {
                console.error('Error fetching reviews:', error);
            }
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching reviews:', error);
        return [];
    }
};

/**
 * Get review statistics for a product
 */
export const getReviewStats = async (productId: number): Promise<ReviewStats> => {
    try {
        const { data, error } = await supabase
            .from('product_reviews')
            .select('rating')
            .eq('product_id', productId);

        if (error || !data || data.length === 0) {
            if (error && error.code !== '42P01') {
                console.error('Error fetching review stats:', error);
            }
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            };
        }

        const totalReviews = data.length;
        const sum = data.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = Math.round((sum / totalReviews) * 10) / 10;

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        data.forEach(review => {
            const rating = review.rating as 1 | 2 | 3 | 4 | 5;
            if (rating >= 1 && rating <= 5) {
                distribution[rating]++;
            }
        });

        return {
            averageRating,
            totalReviews,
            ratingDistribution: distribution
        };
    } catch (error) {
        console.error('Error fetching review stats:', error);
        return {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };
    }
};

/**
 * Submit a review for a product
 */
export const submitReview = async (
    productId: number,
    rating: number,
    comment?: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Please log in to submit a review' };
        }

        // Check if user already reviewed this product
        const { data: existing } = await supabase
            .from('product_reviews')
            .select('id')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .single();

        if (existing) {
            return { success: false, error: 'You have already reviewed this product' };
        }

        const { error } = await supabase.from('product_reviews').insert({
            user_id: user.id,
            product_id: productId,
            rating,
            comment: comment || null
        });

        if (error) {
            console.error('Error submitting review:', error);
            return { success: false, error: 'Failed to submit review' };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error submitting review:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
};

/**
 * Check if user has already reviewed a product
 */
export const hasUserReviewed = async (userId: string, productId: number): Promise<boolean> => {
    try {
        const { data, error } = await supabase
            .from('product_reviews')
            .select('id')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error checking if user reviewed:', error);
            return false;
        }

        return !!data;
    } catch (error) {
        console.error('Unexpected error checking user review:', error);
        return false;
    }
};

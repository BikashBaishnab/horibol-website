/**
 * Product Service
 * 
 * Product-related API functions.
 */

import { supabase } from '../lib/supabase';
import type { Category, HeroSlide, Product, ProductDetail } from '../types';
import type { SearchResultProduct } from '../types/search.types';

/**
 * Get product detail with variant info using RPC
 */
export const getProductDetail = async (
    productId: number,
    variantId: number | null = null
): Promise<ProductDetail | null> => {
    try {
        const { data, error } = await supabase
            .rpc('get_product_detail', {
                p_product_id: productId,
                p_variant_id: variantId
            });

        if (error) {
            console.error('Supabase RPC Error:', error.message);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error fetching product details:', error);
        return null;
    }
};

/**
 * Get all products from product_detail_view
 */
export const getProducts = async (): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from('product_detail_view')
            .select('*');

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching products:', error);
        return [];
    }
};

/**
 * Get products from product_detail_view with pagination
 */
export const getProductsPaginated = async (
    page: number = 0,
    pageSize: number = 20
): Promise<Product[]> => {
    try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        const { data, error } = await supabase
            .from('product_detail_view')
            .select('*')
            .range(from, to);

        if (error) {
            console.error('Error fetching paginated products:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching paginated products:', error);
        return [];
    }
};

/**
 * Get all categories
 */
export const getCategories = async (): Promise<Category[]> => {
    try {
        const { data, error } = await supabase
            .from('category')
            .select('*')
            .order('id');

        if (error) {
            console.error('Error fetching categories:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching categories:', error);
        return [];
    }
};

/**
 * Get products by category ID with pagination
 */
export const getProductsByCategory = async (
    categoryId: number,
    page: number = 0,
    pageSize: number = 20
): Promise<Product[]> => {
    try {
        const from = page * pageSize;
        const to = from + pageSize - 1;

        // Include one-level child categories so parent category cards still return products.
        const categoryIds = [categoryId];
        const { data: childCategories, error: childError } = await supabase
            .from('category')
            .select('id')
            .eq('parent_id', categoryId);

        if (!childError && childCategories?.length) {
            categoryIds.push(...childCategories.map((row: { id: number }) => row.id));
        }

        const query = supabase
            .from('product_detail_view')
            .select('*')
            .range(from, to);

        const { data, error } = categoryIds.length > 1
            ? await query.in('category_id', categoryIds)
            : await query.eq('category_id', categoryId);

        if (error) {
            console.error('Error fetching products by category:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching products by category:', error);
        return [];
    }
};

/**
 * Get hero slider images
 */
export const getHeroSlides = async (): Promise<HeroSlide[]> => {
    try {
        const { data, error } = await supabase
            .from('hero_slider')
            .select('*');

        if (error) {
            console.error('Error fetching hero slides:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching hero slides:', error);
        return [];
    }
};

/**
 * Search products with filters
 * Queries product_detail_view with optional price range, brand, and sorting
 */
export const searchProductsWithFilters = async (
    query: string,
    filters?: {
        priceRange?: { min: number | null; max: number | null } | null;
        brands?: string[];
        sortBy?: 'relevance' | 'price_low_high' | 'price_high_low' | 'newest' | 'discount';
    }
): Promise<SearchResultProduct[]> => {
    try {
        let queryBuilder = supabase
            .from('product_detail_view')
            .select('product_id, product_name, brand_name, price, mrp, discount_percentage, main_image, stock, attributes, average_rating, total_reviews, is_cod');


        // Text search using ilike on product_name and brand_name
        // PostgREST requires values with special characters (comma, parentheses) to be double-quoted
        if (query && query.trim()) {
            // Escape double quotes within the query by doubling them
            const escapedQuery = query.replace(/"/g, '""');

            console.log('Search query:', query, '-> Escaped:', escapedQuery);

            // Wrap the pattern in double quotes to handle special characters
            queryBuilder = queryBuilder.or(`product_name.ilike."%${escapedQuery}%",brand_name.ilike."%${escapedQuery}%"`);
        }

        // Price range filter
        if (filters?.priceRange) {
            if (filters.priceRange.min !== null) {
                queryBuilder = queryBuilder.gte('price', filters.priceRange.min);
            }
            if (filters.priceRange.max !== null) {
                queryBuilder = queryBuilder.lte('price', filters.priceRange.max);
            }
        }

        // Brand filter
        if (filters?.brands && filters.brands.length > 0) {
            queryBuilder = queryBuilder.in('brand_name', filters.brands);
        }

        // Sorting
        switch (filters?.sortBy) {
            case 'price_low_high':
                queryBuilder = queryBuilder.order('price', { ascending: true });
                break;
            case 'price_high_low':
                queryBuilder = queryBuilder.order('price', { ascending: false });
                break;
            case 'newest':
                queryBuilder = queryBuilder.order('product_id', { ascending: false });
                break;
            case 'discount':
                queryBuilder = queryBuilder.order('discount_percentage', { ascending: false });
                break;
            default:
                // relevance - no specific order, just return matches
                break;
        }

        const { data, error } = await queryBuilder;

        if (error) {
            console.error('Error searching products:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error searching products:', error);
        return [];
    }
};

/**
 * Get all unique brands from product_detail_view
 */
export const getBrands = async (): Promise<string[]> => {
    try {
        const { data, error } = await supabase
            .from('product_detail_view')
            .select('brand_name')
            .not('brand_name', 'is', null);

        if (error) {
            console.error('Error fetching brands:', error);
            return [];
        }

        // Extract unique brand names
        const brands = [...new Set(data?.map(item => item.brand_name).filter(Boolean))] as string[];
        return brands.sort();
    } catch (error) {
        console.error('Unexpected error fetching brands:', error);
        return [];
    }
};

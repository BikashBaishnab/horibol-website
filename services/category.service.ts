/**
 * Category Service
 * 
 * Functions for fetching categories with hierarchy support.
 */

import { supabase } from '../lib/supabase';

export interface Category {
    id: number;
    name: string;
    image: string | null;
    image_url: string | null;
    parent_id: number | null;
    show_brands?: boolean;
}

export interface CategoryWithChildren extends Category {
    children: CategoryWithChildren[];
    productCount?: number;
}

/**
 * Get all categories
 */
export const getCategories = async (): Promise<Category[]> => {
    try {
        const { data, error } = await supabase
            .from('category')
            .select('*')
            .order('sort_order', { ascending: true });

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
 * Get categories with hierarchy (parent categories with their children)
 */
export const getCategoriesWithHierarchy = async (): Promise<CategoryWithChildren[]> => {
    try {
        const categories = await getCategories();

        // Helper function to build hierarchy recursively
        const buildHierarchy = (parentId: number | null): CategoryWithChildren[] => {
            return categories
                .filter(c => c.parent_id === parentId)
                .map(category => ({
                    ...category,
                    children: buildHierarchy(category.id)
                }));
        };

        return buildHierarchy(null);
    } catch (error) {
        console.error('Error building category hierarchy:', error);
        return [];
    }
};

/**
 * Get subcategories by parent ID
 */
export const getSubcategories = async (parentId: number): Promise<Category[]> => {
    try {
        const { data, error } = await supabase
            .from('category')
            .select('id, name, image, image_url, parent_id, sort_order')
            .eq('parent_id', parentId)
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Error fetching subcategories:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching subcategories:', error);
        return [];
    }
};

/**
 * Get product count by category
 */
export const getProductCountByCategory = async (categoryId: number): Promise<number> => {
    try {
        const { count, error } = await supabase
            .from('product')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', categoryId);

        if (error) {
            console.error('Error fetching product count:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('Unexpected error fetching product count:', error);
        return 0;
    }
};

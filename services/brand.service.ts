import { supabase } from '../lib/supabase';

export interface Brand {
    id: number;
    name: string;
    image: string | null;
    is_featured?: boolean;
}

/**
 * Fetch brands with their logos, optionally filtered by category or featured status
 */
export const getBrandsWithLogos = async (options?: { categoryId?: number; onlyFeatured?: boolean }): Promise<Brand[]> => {
    try {
        const { categoryId, onlyFeatured } = options || {};

        let query = supabase
            .from('brand')
            .select(`
                id,
                name,
                image,
                is_featured,
                product!inner(category_id)
            `)
            .order('name');

        if (onlyFeatured) {
            query = query.eq('is_featured', true);
        }
        if (categoryId) {
            // Filter brands that have products in this category or its subcategories
            // We fetch the category and its children first to be thorough
            const { data: categoryIds } = await supabase
                .from('category')
                .select('id')
                .or(`id.eq.${categoryId},parent_id.eq.${categoryId}`);

            const ids = categoryIds?.map(c => c.id) || [categoryId];
            query = query.in('product.category_id', ids);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching brands with logos:', error);
            return [];
        }

        // Create a unique list of brands by ID
        const brandMap = new Map<number, Brand>();
        data?.forEach((item: any) => {
            if (!brandMap.has(item.id)) {
                const { product, ...brand } = item;
                brandMap.set(brand.id, brand as Brand);
            }
        });

        const brands = Array.from(brandMap.values());

        // Final sorting by name (case-insensitive)
        return brands.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    } catch (error) {
        console.error('Unexpected error fetching brands:', error);
        return [];
    }
};

/**
 * Search Types
 * 
 * Types for search functionality including filters, results, and sorting.
 */

// ============================================================
// SORT OPTIONS
// ============================================================

export type SortOption =
    | 'relevance'
    | 'price_low_high'
    | 'price_high_low'
    | 'newest'
    | 'discount';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_low_high', label: 'Price: Low to High' },
    { value: 'price_high_low', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'discount', label: 'Discount' },
];

// ============================================================
// PRICE RANGE OPTIONS
// ============================================================

export interface PriceRange {
    min: number | null;
    max: number | null;
    label: string;
}

export const PRICE_RANGES: PriceRange[] = [
    { min: null, max: 5000, label: 'Under ₹5,000' },
    { min: 5000, max: 10000, label: '₹5,000 - ₹10,000' },
    { min: 10000, max: 20000, label: '₹10,000 - ₹20,000' },
    { min: 20000, max: 50000, label: '₹20,000 - ₹50,000' },
    { min: 50000, max: null, label: 'Above ₹50,000' },
];

// ============================================================
// SEARCH FILTERS
// ============================================================

export interface SearchFilters {
    query: string;
    priceRange?: PriceRange | null;
    brands?: string[];
    sortBy?: SortOption;
}

// ============================================================
// SEARCH RESULT PRODUCT
// ============================================================

export interface SearchResultProduct {
    product_id: number;
    product_name: string;
    brand_name: string | null;
    price: number;
    mrp: number;
    discount_percentage: number;
    main_image: string | null;
    stock: number;
    attributes?: Record<string, any> | null;
    average_rating?: number | null;
    total_reviews?: number | null;
    is_cod?: boolean;

}

// ============================================================
// BRAND OPTION
// ============================================================

export interface BrandOption {
    name: string;
    count?: number;
}

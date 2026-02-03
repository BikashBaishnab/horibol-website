/**
 * useProducts Hook
 * 
 * Custom hook for fetching and managing products data.
 */

import { useCallback, useEffect, useState } from 'react';
import { getCategories, getHeroSlides, getProducts } from '../services/product.service';
import type { Category, HeroSlide, Product } from '../types';

interface UseProductsReturn {
    products: Product[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}

export function useProducts(): UseProductsReturn {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getProducts();
            setProducts(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch products'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {
        products,
        loading,
        error,
        refresh: fetchProducts,
    };
}

interface UseHomeDataReturn {
    products: Product[];
    categories: Category[];
    heroSlides: HeroSlide[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}

export function useHomeData(): UseHomeDataReturn {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [prodData, catData, slideData] = await Promise.all([
                getProducts(),
                getCategories(),
                getHeroSlides(),
            ]);
            setProducts(prodData);
            setCategories(catData);
            setHeroSlides(slideData);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch home data'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        products,
        categories,
        heroSlides,
        loading,
        error,
        refresh: fetchData,
    };
}

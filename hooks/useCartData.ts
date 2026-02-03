/**
 * Enhanced Cart Hook
 * 
 * Custom hook for cart operations, replacing CartContext functionality.
 * Can be used alongside or instead of CartContext.
 */

import { useCallback, useEffect, useState } from 'react';
import {
    addToCart as addToCartService,
    getCartCount,
    getCartItems,
    removeFromCart as removeFromCartService,
    updateCartQuantity as updateQuantityService
} from '../services/cart.service';
import type { CartItem, CartSummary } from '../types';

interface UseCartReturn {
    items: CartItem[];
    count: number;
    summary: CartSummary;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    addItem: (productId: number, variantId: number | null) => Promise<boolean>;
    updateQuantity: (cartId: number, quantity: number) => Promise<void>;
    removeItem: (cartId: number) => Promise<void>;
}

export function useCartData(): UseCartReturn {
    const [items, setItems] = useState<CartItem[]>([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const calculateSummary = (cartItems: CartItem[]): CartSummary => {
        const validItems = cartItems.filter(item => (item.stock || 0) > 0);
        const totalMRP = validItems.reduce((sum, item) => sum + (item.unit_mrp * item.quantity), 0);
        const totalSellingPrice = validItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
        const totalDiscount = totalMRP - totalSellingPrice;
        const deliveryFee = 0;

        return {
            totalItems: validItems.length,
            totalMRP,
            totalSellingPrice,
            totalDiscount,
            deliveryFee,
            finalAmount: totalSellingPrice + deliveryFee,
        };
    };

    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [cartData, cartCount] = await Promise.all([
                getCartItems(),
                getCartCount(),
            ]);
            setItems(cartData);
            setCount(cartCount);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch cart'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addItem = async (productId: number, variantId: number | null): Promise<boolean> => {
        const result = await addToCartService(productId, variantId);
        await fetchCart();
        return result;
    };

    const updateQuantity = async (cartId: number, quantity: number): Promise<void> => {
        // Optimistic update
        setItems(prev => prev.map(item =>
            item.cart_id === cartId ? { ...item, quantity } : item
        ));

        try {
            await updateQuantityService(cartId, quantity);
            await fetchCart();
        } catch (err) {
            // Revert on error
            await fetchCart();
            throw err;
        }
    };

    const removeItem = async (cartId: number): Promise<void> => {
        await removeFromCartService(cartId);
        await fetchCart();
    };

    return {
        items,
        count,
        summary: calculateSummary(items),
        loading,
        error,
        refresh: fetchCart,
        addItem,
        updateQuantity,
        removeItem,
    };
}

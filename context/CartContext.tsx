import { usePostHog } from 'posthog-react-native';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { addToCart as addToCartService, getCartCount, removeFromCart as removeFromCartService } from '../services/cart.service';

type CartContextType = {
    cartCount: number;
    refreshCartCount: () => Promise<void>;
    addToCart: (product: any, variantId: number | null) => Promise<void>;
    removeFromCart: (cartId: number, productId: number) => Promise<void>;
};

const CartContext = createContext<CartContextType>({
    cartCount: 0,
    refreshCartCount: async () => { },
    addToCart: async () => { },
    removeFromCart: async () => { },
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cartCount, setCartCount] = useState(0);
    const posthog = usePostHog();

    const refreshCartCount = async () => {
        const count = await getCartCount();
        setCartCount(count);
    };

    const addToCart = async (product: any, variantId: number | null) => {
        await addToCartService(product.id || product.product_id, variantId);
        await refreshCartCount();

        // Track event
        posthog.capture('Product Added to Cart', {
            product_id: product.id || product.product_id,
            product_name: product.name || product.product_name,
            price: product.price || product.selected?.price,
            variant_id: variantId,
            currency: 'INR'
        });
    };

    const removeFromCart = async (cartId: number, productId: number) => {
        await removeFromCartService(cartId);
        await refreshCartCount();

        // Track event
        posthog.capture('Product Removed from Cart', {
            product_id: productId
        });
    };

    // Refresh on mount and auth changes
    useEffect(() => {
        refreshCartCount();

        // Listen for auth changes to refresh cart
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            refreshCartCount();
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <CartContext.Provider value={{ cartCount, refreshCartCount, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
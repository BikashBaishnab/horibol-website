/**
 * Order Service
 * 
 * Functions for fetching orders, order details, and tracking.
 */

import { supabase } from '../lib/supabase';

// Types
export interface OrderListItem {
    item_id: number;
    product_name: string;
    product_image_url: string | null;
    item_status: string;
    delivery_date: string | null;
    product_id: number;
    variant_name: string | null;
    brand_name: string | null;
    order_id: number;
    user_id: string;
    order_date: string;
    master_order_status: string;
    shipping_address_snapshot: ShippingAddress;
    total_amount: number;
    shipping_fee: number;
    attributes?: Record<string, any> | null;
}


export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    variant_id: number | null;
    product_name: string;
    variant_name: string | null;
    product_image_url: string | null;
    quantity: number;
    price_at_purchase: number;
    total_item_price: number;
    status: string;
    delivery_date: string | null;
    brand_name: string | null;
    attributes?: Record<string, any> | null;
}


export interface OrderTimeline {
    id: number;
    order_id: number;
    status_title: string;
    status_description: string | null;
    location: string | null;
    awb: string | null;
    courier_name: string | null;
    created_at: string;
}

export interface ShippingAddress {
    name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
}

export interface OrderDetail {
    id: number;
    order_date: string;
    status: string;
    payment_status: string;
    payment_method: string | null;
    total_amount: number;
    shipping_fee: number;
    razorpay_order_id: string | null;
    razorpay_payment_id: string | null;
    shiprocket_order_id: string | null;
    awb_code: string | null;
    shipping_address_snapshot: ShippingAddress;
    items: OrderItem[];
    timeline: OrderTimeline[];
}

/**
 * Get user's orders list
 */
export const getUserOrders = async (userId: string): Promise<OrderListItem[]> => {
    try {
        const { data, error } = await supabase
            .from('my_orders_list_view')
            .select('*')
            .eq('user_id', userId)
            .order('order_date', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching orders:', error);
        return [];
    }
};

/**
 * Get order detail with items and timeline
 */
export const getOrderDetail = async (orderId: number): Promise<OrderDetail | null> => {
    try {
        // Fetch order basic info
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError) {
            console.error('Error fetching order:', orderError);
            return null;
        }

        // Fetch order items with variant attributes
        const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*, product_variant:variant_id(attributes)')
            .eq('order_id', orderId);

        if (itemsError) {
            console.error('Error fetching order items:', itemsError);
        }

        // Map the items to include attributes from the joined variant
        const itemsWithAttributes = (itemsData || []).map((item: any) => ({
            ...item,
            attributes: item.product_variant?.attributes
        }));


        // Fetch order timeline
        const { data: timelineData, error: timelineError } = await supabase
            .from('order_timeline')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: true });

        if (timelineError) {
            console.error('Error fetching order timeline:', timelineError);
        }

        return {
            id: orderData.id,
            order_date: orderData.created_at,
            status: orderData.status,
            payment_status: orderData.payment_status,
            payment_method: orderData.payment_method,
            total_amount: orderData.total_amount,
            shipping_fee: orderData.shipping_fee,
            razorpay_order_id: orderData.razorpay_order_id,
            razorpay_payment_id: orderData.razorpay_payment_id,
            shiprocket_order_id: orderData.shiprocket_order_id,
            awb_code: orderData.awb_code,
            shipping_address_snapshot: orderData.shipping_address_snapshot,
            items: itemsWithAttributes,
            timeline: timelineData || [],
        };

    } catch (error) {
        console.error('Unexpected error fetching order detail:', error);
        return null;
    }
};

/**
 * Get order timeline/tracking info
 */
export const getOrderTimeline = async (orderId: number): Promise<OrderTimeline[]> => {
    try {
        const { data, error } = await supabase
            .from('order_timeline')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching order timeline:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching order timeline:', error);
        return [];
    }
};

/**
 * Get status color for order status
 */
export const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
        'placed': '#3498db',
        'confirmed': '#2ecc71',
        'processing': '#f39c12',
        'shipped': '#9b59b6',
        'out_for_delivery': '#e74c3c',
        'delivered': '#27ae60',
        'cancelled': '#95a5a6',
        'returned': '#e67e22',
    };
    return statusColors[status.toLowerCase()] || '#7f8c8d';
};

/**
 * Get human-readable status label
 */
export const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
        'placed': 'Order Placed',
        'confirmed': 'Confirmed',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'out_for_delivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
        'returned': 'Returned',
    };
    return statusLabels[status.toLowerCase()] || status;
};

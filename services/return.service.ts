/**
 * Return Service
 * 
 * Functions for managing product returns and refunds.
 */

import { supabase } from '../lib/supabase';
import type {
    Refund,
    ReturnRequest,
    ReturnStatus
} from '../types';

export interface CreateReturnInput {
    order_item_id: number;
    reason: string;
    reason_details?: string;
}

// Return reasons
export const RETURN_REASONS = [
    { id: 'defective', label: 'Product is defective or damaged' },
    { id: 'wrong_item', label: 'Received wrong item' },
    { id: 'not_as_described', label: 'Product not as described' },
    { id: 'size_issue', label: 'Size/fit issue' },
    { id: 'quality', label: 'Quality not satisfactory' },
    { id: 'changed_mind', label: 'Changed my mind' },
    { id: 'other', label: 'Other reason' },
];

/**
 * Process a refund for a return request
 * Secured by Edge Function
 */
export const processRefund = async (
    returnId: number,
    amount: number
): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return { success: false, error: 'Unauthorized' };

        const { data, error } = await supabase.functions.invoke('process-refund', {
            body: { return_id: returnId, amount },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        return { success: true, data };
    } catch (error: any) {
        console.error('Process refund error:', error);
        return { success: false, error: error.message || 'Refund processing failed' };
    }
};

/**
 * Create a return request for an order item
 */
export const createReturnRequest = async (
    input: CreateReturnInput
): Promise<{ success: boolean; return_id?: number; error?: string }> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'Please log in to request a return' };
        }

        // Check if item is eligible for return (within 7 days of delivery)
        const { data: orderItem, error: itemError } = await supabase
            .from('order_items')
            .select(`
                id,
                status,
                delivery_date,
                order_id,
                orders!inner(user_id)
            `)
            .eq('id', input.order_item_id)
            .single();

        if (itemError || !orderItem) {
            return { success: false, error: 'Order item not found' };
        }

        // Verify ownership
        if ((orderItem as any).orders?.user_id !== user.id) {
            return { success: false, error: 'Unauthorized' };
        }

        // Check if already returned
        if (orderItem.status === 'returned' || orderItem.status === 'return_requested') {
            return { success: false, error: 'Return already requested for this item' };
        }

        // Check if delivered
        if (orderItem.status !== 'delivered') {
            return { success: false, error: 'Item must be delivered before requesting return' };
        }

        // Check return window (7 days)
        if (orderItem.delivery_date) {
            const deliveryDate = new Date(orderItem.delivery_date);
            const daysSinceDelivery = Math.floor(
                (Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceDelivery > 7) {
                return { success: false, error: 'Return window has expired (7 days)' };
            }
        }

        // Check for existing pending return
        const { data: existingReturn } = await supabase
            .from('return_requests')
            .select('id')
            .eq('order_item_id', input.order_item_id)
            .neq('status', 'cancelled')
            .neq('status', 'rejected')
            .single();

        if (existingReturn) {
            return { success: false, error: 'A return request already exists for this item' };
        }

        // Create return request
        const { data, error } = await supabase
            .from('return_requests')
            .insert({
                order_item_id: input.order_item_id,
                user_id: user.id,
                reason: input.reason,
                reason_details: input.reason_details || null,
                status: 'pending',
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error creating return request:', error);
            return { success: false, error: 'Failed to create return request' };
        }

        // Update order item status
        await supabase
            .from('order_items')
            .update({ status: 'return_requested' })
            .eq('id', input.order_item_id);

        return { success: true, return_id: data.id };
    } catch (error) {
        console.error('Unexpected error creating return:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
};

/**
 * Get user's return requests
 */
export const getUserReturnRequests = async (): Promise<ReturnRequest[]> => {
    try {
        const { data, error } = await supabase
            .from('return_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching return requests:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching returns:', error);
        return [];
    }
};

/**
 * Get a specific return request with order item details
 */
export const getReturnRequestDetail = async (
    returnId: number
): Promise<(ReturnRequest & { order_item?: any }) | null> => {
    try {
        const { data, error } = await supabase
            .from('return_requests')
            .select(`
                *,
                order_items (
                    id,
                    product_name,
                    product_image_url,
                    quantity,
                    price_at_purchase,
                    variant_name,
                    order_id
                )
            `)
            .eq('id', returnId)
            .single();

        if (error) {
            console.error('Error fetching return detail:', error);
            return null;
        }

        return data as (ReturnRequest & { order_item?: any });
    } catch (error) {
        console.error('Unexpected error fetching return detail:', error);
        return null;
    }
};

/**
 * Cancel a pending return request
 */
export const cancelReturnRequest = async (
    returnId: number
): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase
            .from('return_requests')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', returnId)
            .eq('status', 'pending');

        if (error) {
            console.error('Error cancelling return:', error);
            return { success: false, error: 'Failed to cancel return request' };
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error cancelling return:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
};

/**
 * Get user's refunds
 */
export const getUserRefunds = async (): Promise<Refund[]> => {
    try {
        const { data, error } = await supabase
            .from('refunds')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching refunds:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching refunds:', error);
        return [];
    }
};

/**
 * Get return status label
 */
export const getReturnStatusLabel = (status: ReturnStatus): string => {
    const labels: Record<ReturnStatus, string> = {
        pending: 'Pending Review',
        approved: 'Approved',
        rejected: 'Rejected',
        pickup_scheduled: 'Pickup Scheduled',
        in_transit: 'In Transit',
        received: 'Received',
        refund_initiated: 'Refund Initiated',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };
    return labels[status] || status;
};

/**
 * Get return status color
 */
export const getReturnStatusColor = (status: ReturnStatus): string => {
    const colors: Record<ReturnStatus, string> = {
        pending: '#f39c12',
        approved: '#27ae60',
        rejected: '#e74c3c',
        pickup_scheduled: '#3498db',
        in_transit: '#9b59b6',
        received: '#2ecc71',
        refund_initiated: '#1abc9c',
        completed: '#27ae60',
        cancelled: '#95a5a6',
    };
    return colors[status] || '#7f8c8d';
};

/**
 * Shipping Service
 * 
 * Logistics and delivery related functions.
 */

import { supabase } from '../lib/supabase';
import type { ServiceabilityResponse } from '../types';

/**
 * Check delivery serviceability for a pincode
 */
export const checkServiceability = async (
    pincode: number,
    weight: number = 0.5,
    length: number = 10,
    breadth: number = 10,
    height: number = 10
): Promise<ServiceabilityResponse | null> => {
    try {
        const { data, error } = await supabase.functions.invoke('shiprocket-check', {
            body: {
                deliveryPin: pincode,
                weight,
                length,
                breadth,
                height
            }
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('EDD Check Error:', error);
        return null;
    }
};

/**
 * Get estimated delivery date string
 */
export const getEstimatedDeliveryDate = async (
    pincode: number,
    weight: number = 0.5
): Promise<string> => {
    const response = await checkServiceability(pincode, weight);

    if (!response) return "Check pincode";
    if (!response.serviceable) return "Not deliverable";

    return response.display_date || "Check delivery date";
};

/**
 * Address Service
 * 
 * User address management functions.
 */

import { supabase } from '../lib/supabase';
import type { Address, AddressInput } from '../types';

/**
 * Check if user has any saved addresses
 */
export const hasAddresses = async (): Promise<boolean> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { count, error } = await supabase
            .from('user_addresses')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        if (error) throw error;
        return (count || 0) > 0;
    } catch (error) {
        console.error('Error checking address count:', error);
        return false;
    }
};

/**
 * Get all user addresses
 */
export const getUserAddresses = async (): Promise<Address[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching user addresses:', error);
        return [];
    }
};

/**
 * Get default address
 */
export const getDefaultAddress = async (): Promise<Address | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

    if (error) return null;
    return data;
};

/**
 * Add new address
 */
export const addUserAddress = async (addressData: AddressInput): Promise<Address> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not logged in");

        const isFirstAddress = !(await hasAddresses());

        const { data, error } = await supabase
            .from('user_addresses')
            .insert([{
                ...addressData,
                user_id: user.id,
                is_default: isFirstAddress || addressData.is_default
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding address:', error);
        throw error;
    }
};

/**
 * Update existing address
 */
export const updateAddress = async (
    addressId: number,
    addressData: Partial<AddressInput>
): Promise<Address | null> => {
    try {
        const { data, error } = await supabase
            .from('user_addresses')
            .update(addressData)
            .eq('id', addressId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
};

/**
 * Delete address
 */
export const deleteAddress = async (addressId: number): Promise<void> => {
    const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

    if (error) throw error;
};

/**
 * Set address as default
 */
export const setDefaultAddress = async (addressId: number): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in");

    // First, unset all defaults
    await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

    // Then set the new default
    await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', addressId);
};

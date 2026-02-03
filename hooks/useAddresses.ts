/**
 * useAddresses Hook
 * 
 * Custom hook for fetching and managing user addresses.
 */

import { useCallback, useEffect, useState } from 'react';
import {
    addUserAddress,
    deleteAddress,
    getDefaultAddress,
    getUserAddresses,
    setDefaultAddress
} from '../services/address.service';
import type { Address, AddressInput } from '../types';

interface UseAddressesReturn {
    addresses: Address[];
    defaultAddress: Address | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    addAddress: (data: AddressInput) => Promise<Address>;
    removeAddress: (id: number) => Promise<void>;
    setAsDefault: (id: number) => Promise<void>;
}

export function useAddresses(): UseAddressesReturn {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [defaultAddress, setDefaultAddr] = useState<Address | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchAddresses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [addrData, defAddr] = await Promise.all([
                getUserAddresses(),
                getDefaultAddress(),
            ]);
            setAddresses(addrData);
            setDefaultAddr(defAddr);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch addresses'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const addNewAddress = async (data: AddressInput): Promise<Address> => {
        const newAddress = await addUserAddress(data);
        await fetchAddresses();
        return newAddress;
    };

    const removeAddress = async (id: number): Promise<void> => {
        await deleteAddress(id);
        await fetchAddresses();
    };

    const setAsDefault = async (id: number): Promise<void> => {
        await setDefaultAddress(id);
        await fetchAddresses();
    };

    return {
        addresses,
        defaultAddress,
        loading,
        error,
        refresh: fetchAddresses,
        addAddress: addNewAddress,
        removeAddress,
        setAsDefault,
    };
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDefaultAddress } from '../services/address.service';
import { useAuth } from './AuthContext';

type LocationContextType = {
    pincode: string;
    city: string;
    setPincode: (pin: string) => Promise<void>;
    locationLoading: boolean;
};

const UserLocationContext = createContext<LocationContextType>({
    pincode: '',
    city: '',
    setPincode: async () => { },
    locationLoading: true,
});

export const UserLocationProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [pincode, setPincodeState] = useState('');
    const [city, setCity] = useState('');
    const [locationLoading, setLoading] = useState(true);

    // 1. Initialize Pincode on App Start & When User Logs In/Out
    useEffect(() => {
        loadInitialPincode();
    }, [user]);

    const loadInitialPincode = async () => {
        setLoading(true);
        try {
            // PHASE 1: Try Database (Only if Logged In)
            if (user) {
                const address = await getDefaultAddress();

                // If they HAVE an address, use it and stop here.
                if (address) {
                    setPincodeState(address.pincode);
                    setCity(address.city || '');
                    setLoading(false);
                    return;
                }
                // If address is NULL (New User), we continue to Phase 2...
            }

            // PHASE 2: Try Local Storage (Guest Memory)
            // This runs for Guests AND New Users who haven't saved an address yet
            const storedPin = await AsyncStorage.getItem('guest_pincode');
            if (storedPin) {
                setPincodeState(storedPin);
            } else {
                // PHASE 3: No Data anywhere
                setPincodeState(''); // Reset to empty
            }

        } catch (e) {
            console.error("Location Load Error:", e);
        } finally {
            setLoading(false);
        }
    };

    // 2. Manually Update Pincode (User types it in the box)
    const setPincode = async (newPin: string) => {
        setPincodeState(newPin);
        // Always save to storage so we remember it next time they open the app
        await AsyncStorage.setItem('guest_pincode', newPin);
    };

    return (
        <UserLocationContext.Provider value={{ pincode, city, setPincode, locationLoading }}>
            {children}
        </UserLocationContext.Provider>
    );
};

export const useUserLocation = () => useContext(UserLocationContext);
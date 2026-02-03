import { Session, User } from '@supabase/supabase-js';
import { usePostHog } from 'posthog-react-native';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    loading: boolean;
    isAdmin: boolean; // Future proofing
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    loading: true,
    isAdmin: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const posthog = usePostHog();

    // Helper function to identify user in PostHog
    const identifyUser = (userData: User | null) => {
        if (userData) {
            posthog.identify(userData.id, {
                email: userData.email ?? '',
                phone: userData.phone ?? '',
                last_login: new Date().toISOString()
            });
        } else {
            posthog.reset();
        }
    };

    useEffect(() => {
        // 1. Check active session on App Start
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    identifyUser(session.user);
                }
            } catch (error) {
                // Handle error silently (treat as guest)
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // 2. Listen for Login/Logout events automatically
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const newUser = session?.user ?? null;
            setSession(session);
            setUser(newUser);
            setLoading(false);

            // Trigger PostHog Identify/Reset
            identifyUser(newUser);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ session, user, loading, isAdmin: false }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
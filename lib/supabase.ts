import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

// Prevent build-time crash if variables are missing
const isBuild = typeof window === 'undefined';
if (!supabaseUrl || !supabaseKey) {
    if (isBuild) {
        console.warn('Supabase environment variables are missing during build. Using placeholders.');
    }
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder'
);
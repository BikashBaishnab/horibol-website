/**
 * Supabase Client
 * 
 * This file contains ONLY the Supabase client initialization.
 * All API functions have been moved to the services/ folder.
 * 
 * @example
 * import { supabase } from '@/lib/supabase';
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
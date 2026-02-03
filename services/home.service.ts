/**
 * Home Service
 * 
 * Fetches advanced server-driven UI configurations for the Home Screen.
 */

import { supabase } from '../lib/supabase';
import type { HomeSection } from '../types';

/**
 * Fetch all active home sections with their items, ordered by sort_order
 */
export const getHomeSections = async (): Promise<HomeSection[]> => {
    try {
        const { data, error } = await supabase
            .from('home_sections')
            .select('*, items:home_section_items(*)')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Error fetching home sections:', error);
            return [];
        }

        // Sort items within each section
        const sections = (data || []).map(section => ({
            ...section,
            items: (section.items || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
        })) as HomeSection[];

        return sections;
    } catch (error) {
        console.error('Unexpected error fetching home sections:', error);
        return [];
    }
};

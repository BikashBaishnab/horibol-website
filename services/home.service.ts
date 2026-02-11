/**
 * Home Service
 *
 * Fetches home sections and items using canonical minimal schema.
 * Uses separate queries (no embedded relation) to avoid PGRST201 ambiguity.
 */

import { supabase } from '../lib/supabase';
import type { HomeSection, HomeSectionItem } from '../types';

type HomeSectionRow = {
    id: number;
    title?: string | null;
    subtitle?: string | null;
    layout_type?: HomeSection['layout_type'] | null;
    bg_color?: string | null;
    bg_colour?: string | null;
    bg_image?: string | null;
    sort_order?: number | null;
    is_active?: boolean | null;
};

type HomeSectionItemRow = {
    id: number;
    section_id?: number | null;
    title?: string | null;
    subtitle?: string | null;
    image_url?: string | null;
    action_type?: HomeSectionItem['action_type'] | null;
    product_id?: number | null;
    category_id?: number | null;
    sort_order?: number | null;
    is_active?: boolean | null;
};

function normalizeLayout(layout?: string | null): HomeSection['layout_type'] {
    const value = (layout ?? '').toLowerCase();
    if (value === 'scroll_horizontal' || value === 'grid_2x2' || value === 'staggered' || value === 'banner') {
        return value as HomeSection['layout_type'];
    }
    return 'scroll_horizontal';
}

function normalizeAction(action?: string | null): HomeSectionItem['action_type'] {
    const value = (action ?? '').toLowerCase();
    if (value === 'product' || value === 'category' || value === 'none') {
        return value as HomeSectionItem['action_type'];
    }
    return 'none';
}

function normalizeSectionColor(section: HomeSectionRow): string {
    const american = (section.bg_color ?? '').trim();
    if (american) return american;

    const british = (section.bg_colour ?? '').trim();
    if (british) return british;

    return '';
}

function normalizeBackgroundImage(section: HomeSectionRow): string | undefined {
    const bgImage = (section.bg_image ?? '').trim();
    if (bgImage) return bgImage;

    return undefined;
}

function isMissingColumnError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const err = error as { code?: string; message?: string };
    if (err.code === '42703') return true;
    return /column .* does not exist/i.test(err.message ?? '');
}

/**
 * Fetch all active home sections with their active items, sorted by sort_order.
 */
export const getHomeSections = async (): Promise<HomeSection[]> => {
    try {
        let sectionRows: HomeSectionRow[] | null = null;
        let sectionError: unknown = null;

        const getBaseQuery = () => supabase.from('home_sections');

        const withBackgroundColumns = await getBaseQuery()
            .select('id,title,subtitle,layout_type,bg_color,bg_image,sort_order,is_active')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (!withBackgroundColumns.error) {
            sectionRows = (withBackgroundColumns.data ?? []) as HomeSectionRow[];
        } else if (isMissingColumnError(withBackgroundColumns.error) && /bg_color/i.test((withBackgroundColumns.error as { message?: string }).message ?? '')) {
            const withBritishColor = await getBaseQuery()
                .select('id,title,subtitle,layout_type,bg_colour,bg_image,sort_order,is_active')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (!withBritishColor.error) {
                sectionRows = (withBritishColor.data ?? []) as HomeSectionRow[];
            } else if (isMissingColumnError(withBritishColor.error)) {
                const fallback = await getBaseQuery()
                    .select('id,title,subtitle,layout_type,sort_order,is_active')
                    .eq('is_active', true)
                    .order('sort_order', { ascending: true });
                sectionRows = (fallback.data ?? []) as HomeSectionRow[];
                sectionError = fallback.error;
            } else {
                sectionError = withBritishColor.error;
            }
        } else if (isMissingColumnError(withBackgroundColumns.error)) {
            const fallback = await getBaseQuery()
                .select('id,title,subtitle,layout_type,sort_order,is_active')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });
            sectionRows = (fallback.data ?? []) as HomeSectionRow[];
            sectionError = fallback.error;
        } else {
            sectionError = withBackgroundColumns.error;
        }

        if (sectionError) {
            console.error('Error fetching home sections:', sectionError);
            return [];
        }

        const sections = sectionRows ?? [];
        if (sections.length === 0) return [];

        const sectionIds = sections.map((section) => section.id);

        const { data: itemRows, error: itemError } = await supabase
            .from('home_section_items')
            .select('id,section_id,title,subtitle,image_url,action_type,product_id,category_id,sort_order,is_active')
            .in('section_id', sectionIds)
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (itemError) {
            console.error('Error fetching home section items:', itemError);
            return [];
        }

        const itemsBySection = new Map<number, HomeSectionItem[]>();

        for (const row of (itemRows ?? []) as HomeSectionItemRow[]) {
            const sectionId = Number(row.section_id ?? 0);
            if (!sectionId) continue;

            const item: HomeSectionItem = {
                id: row.id,
                section_id: sectionId,
                title: row.title ?? undefined,
                subtitle: row.subtitle ?? undefined,
                image_url: row.image_url ?? undefined,
                action_type: normalizeAction(row.action_type),
                product_id: row.product_id ?? undefined,
                category_id: row.category_id ?? undefined,
                sort_order: row.sort_order ?? 0,
                is_active: row.is_active ?? true,
            };

            if (!itemsBySection.has(sectionId)) itemsBySection.set(sectionId, []);
            itemsBySection.get(sectionId)!.push(item);
        }

        return sections.map((section) => ({
            id: section.id,
            title: section.title ?? '',
            subtitle: section.subtitle ?? undefined,
            layout_type: normalizeLayout(section.layout_type),
            bg_color: normalizeSectionColor(section),
            bg_image: normalizeBackgroundImage(section),
            sort_order: section.sort_order ?? 0,
            is_active: section.is_active ?? true,
            items: (itemsBySection.get(section.id) ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
        }));
    } catch (error) {
        console.error('Unexpected error fetching home sections:', error);
        return [];
    }
};

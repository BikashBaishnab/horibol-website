/**
 * HoribolApp - TypeScript Type Definitions
 * 
 * Shared interfaces for all data models in the app.
 * Use these types instead of `any` for better type safety.
 */

// ============================================================
// PRODUCT TYPES
// ============================================================

export interface Product {
    product_id: number;
    variant_id?: number | null;
    name: string;
    product_name?: string;
    brand_name?: string;
    price: number;
    mrp?: number;
    discount_percentage?: number;
    main_image: string | null;
    stock?: number;
    average_rating?: number;
    total_reviews?: number;
    is_cod?: boolean;
    attributes?: Record<string, any> | null;
}


export interface ProductVariant {
    variant_id: number;
    price: number;
    mrp: number;
    discount_percentage: number;
    stock: number;
    in_stock: boolean;
    image?: string;
    attributes?: Record<string, any> | null;
}


export interface ProductDetail {
    name: string;
    brand?: {
        id: number;
        name: string;
    };
    selected: {
        variant_id: number | null;
        price: number;
        mrp: number;
        discount_percentage: number;
        stock: number;
        weight_kg?: number;
        length?: number;
        breadth?: number;
        height?: number;
        description?: SpecificationSection[] | string[];
        attributes?: Record<string, any> | null;
    };

    colours?: ProductVariant[];
    options?: ProductVariant[];
    images: string[];
    highlight?: HighlightItem[] | string[];
    description?: SpecificationSection[] | string[];
}

export interface SpecificationSection {
    title: string;
    data_list: SpecificationRow[];
}

export interface SpecificationRow {
    label: string;
    value: string;
}

export interface HighlightItem {
    value: string;
}

// ============================================================
// CART TYPES
// ============================================================

export interface CartItem {
    cart_id: number;
    user_id: string;
    product_id: number;
    variant_id: number | null;
    product_name: string;
    brand_name?: string;
    unit_price: number;
    unit_mrp: number;
    discount_percentage: number;
    quantity: number;
    stock: number;
    image: string;
    is_cod: boolean;
    weight_kg?: number;
    length_cm?: number;
    breadth_cm?: number;
    height_cm?: number;
    created_at?: string;
    attributes?: Record<string, any> | null;
}


export interface CartSummary {
    totalItems: number;
    totalMRP: number;
    totalSellingPrice: number;
    totalDiscount: number;
    deliveryFee: number;
    finalAmount: number;
}

// ============================================================
// ADDRESS TYPES
// ============================================================

export interface Address {
    id: number;
    user_id: string;
    name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    is_default: boolean;
    created_at?: string;
}

export interface AddressInput {
    name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    is_default?: boolean;
}

// ============================================================
// CATEGORY TYPES
// ============================================================

export interface Category {
    id: number;
    name: string;
    image?: string;
}

// ============================================================
// HERO SLIDER TYPES
// ============================================================

export interface HeroSlide {
    id: number;
    slider_image: string;
    link?: string;
}

// ============================================================
// ADVANCED SDUI TYPES
// ============================================================

export interface HomeSection {
    id: number;
    title: string;
    subtitle?: string;
    layout_type: 'scroll_horizontal' | 'grid_2x2' | 'staggered' | 'banner';
    bg_color: string;
    header_bg_image?: string;
    sort_order: number;
    is_active: boolean;
    items?: HomeSectionItem[];
}

export interface HomeSectionItem {
    id: number;
    section_id: number;
    item_type: 'product' | 'brand' | 'category' | 'custom';
    product_id?: number;
    brand_id?: number;
    category_id?: number;
    display_image?: string;
    display_title?: string;
    display_footer?: string;
    action_type?: 'product' | 'category' | 'url';
    action_value?: string;
    sort_order: number;
}

// ============================================================
// SHIPPING/LOGISTICS TYPES
// ============================================================

export interface ServiceabilityResponse {
    serviceable: boolean;
    cod?: boolean; // Whether COD is available for this pincode from Shiprocket
    courier_company_id?: number;
    courier_name?: string;
    estimated_delivery_days?: number;
    display_date?: string;
    etd?: string;
    rate?: number;
}

// ============================================================
// ORDER TYPES
// ============================================================

export interface Order {
    id: number;
    user_id: string;
    order_number: string;
    status: OrderStatus;
    total_amount: number;
    shipping_address: Address;
    items: OrderItem[];
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: number;
    product_id: number;
    variant_id: number | null;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    image?: string;
}

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'returned';

// ============================================================
// SEARCH TYPES
// ============================================================

export interface SearchResult {
    product_id: string;
    product_name: string;
    brand_name?: string;
    main_image?: string;
    price?: number;
    highlight?: {
        brand_name?: string;
        product_name?: string;
    };
}

// ============================================================
// AUTH TYPES
// ============================================================

export interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
}

// Re-export from Supabase for convenience
import type { Session, User } from '@supabase/supabase-js';
export type { Session, User };

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T> {
    data: T | null;
    error: ApiError | null;
}

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
}

// ============================================================
// RETURN TYPES
// ============================================================

export interface ReturnRequest {
    id: number;
    order_item_id: number;
    user_id: string;
    reason: string;
    reason_details: string | null;
    status: ReturnStatus;
    pickup_address: ReturnAddress | null;
    pickup_date: string | null;
    shiprocket_return_id: string | null;
    return_awb: string | null;
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
}

export interface ReturnAddress {
    name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
}

export type ReturnStatus =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'pickup_scheduled'
    | 'in_transit'
    | 'received'
    | 'refund_initiated'
    | 'completed'
    | 'cancelled';

export interface Refund {
    id: number;
    order_id: number;
    return_request_id: number | null;
    user_id: string;
    amount: number;
    refund_type: 'original_payment' | 'wallet' | 'bank_transfer';
    razorpay_refund_id: string | null;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    reason: string | null;
    created_at: string;
    processed_at: string | null;
}

// ============================================================
// COUPON TYPES
// ============================================================

export interface Coupon {
    id: number;
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_value: number;
    max_discount_amount: number | null;
    start_date: string;
    end_date: string | null;
    usage_limit: number | null;
    usage_count: number;
    is_active: boolean;
}

export interface CouponValidationResult {
    valid: boolean;
    error?: string;
    coupon?: Coupon;
    discountAmount?: number;
}

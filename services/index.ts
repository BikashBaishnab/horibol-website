/**
 * Services Index
 * 
 * Central export for all API services.
 * 
 * @example
 * import { authService, cartService } from '@/services';
 * 
 * // Or import specific functions
 * import { addToCart, getCartItems } from '@/services/cart.service';
 */

// Re-export all services
export * from './address.service';
export * from './auth.service';
export * from './cart.service';
export * from './product.service';
export * from './return.service';
export * from './shipping.service';

// Named service objects for convenience
import * as addressService from './address.service';
import * as authService from './auth.service';
import * as cartService from './cart.service';
import * as productService from './product.service';
import * as returnService from './return.service';
import * as shippingService from './shipping.service';

export {
    addressService, authService, cartService, productService, returnService, shippingService
};


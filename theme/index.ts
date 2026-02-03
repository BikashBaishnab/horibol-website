/**
 * HoribolApp Design System
 * 
 * Central export for all design tokens.
 * Import from '@/theme' in your components.
 * 
 * @example
 * import { Colors, Spacing, TextStyles } from '@/theme';
 * 
 * const styles = StyleSheet.create({
 *   container: {
 *     backgroundColor: Colors.background.primary,
 *     padding: Spacing.lg,
 *   },
 *   title: {
 *     ...TextStyles.h2,
 *     color: Colors.text.primary,
 *   },
 * });
 */

export { Colors } from './colors';
export {
    BorderRadius, Dimensions, Shadows, Spacing
} from './spacing';
export {
    FontFamily,
    FontSize,
    FontWeight,
    LineHeight,
    TextStyles
} from './typography';

// Re-export old Colors constant for backward compatibility
// TODO: Remove after migration is complete
export { Colors as LegacyColors } from '../constants/theme';

/**
 * Sequoia Glass Design System
 * Main theme export
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './glassEffects';

import { colors } from './colors';
import { typography, fontFamilies, fontSizes, fontWeights, lineHeights } from './typography';
import { spacing, borderRadius, shadows, zIndex } from './spacing';
import { glassEffects, glassAnimations } from './glassEffects';

/**
 * Complete theme object
 */
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  glassEffects,
  glassAnimations,
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
} as const;

export type Theme = typeof theme;

/**
 * Theme hook (to be used with React Context)
 */
export const useTheme = () => theme;

export default theme;

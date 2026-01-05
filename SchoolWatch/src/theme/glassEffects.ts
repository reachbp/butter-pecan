/**
 * Sequoia Glass Effects
 * Glass morphism effects inspired by macOS Sequoia
 */

import { ViewStyle } from 'react-native';
import { colors } from './colors';
import { borderRadius, shadows } from './spacing';

export interface GlassEffectStyle extends ViewStyle {
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
}

/**
 * Glass effect presets for different use cases
 */
export const glassEffects = {
  // Light glass effect (for light backgrounds)
  light: {
    backgroundColor: colors.glass.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glass.whiteStrong,
    ...shadows.glass,
  } as GlassEffectStyle,

  // Strong light glass effect
  lightStrong: {
    backgroundColor: colors.glass.whiteStrong,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...shadows.md,
  } as GlassEffectStyle,

  // Subtle light glass effect
  lightSubtle: {
    backgroundColor: colors.glass.whiteLight,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.white,
    ...shadows.sm,
  } as GlassEffectStyle,

  // Dark glass effect (for dark backgrounds)
  dark: {
    backgroundColor: colors.glass.dark,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...shadows.glass,
  } as GlassEffectStyle,

  // Card glass effect (primary use case)
  card: {
    backgroundColor: colors.glass.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glass.whiteStrong,
    ...shadows.md,
  } as GlassEffectStyle,

  // Modal overlay glass effect
  modalOverlay: {
    backgroundColor: colors.glass.overlay,
  } as GlassEffectStyle,

  // Modal content glass effect
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.glass.whiteStrong,
    ...shadows.xl,
  } as GlassEffectStyle,

  // Button glass effect
  button: {
    backgroundColor: colors.glass.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glass.whiteStrong,
    ...shadows.sm,
  } as GlassEffectStyle,

  // Navigation bar glass effect
  navbar: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    ...shadows.sm,
  } as GlassEffectStyle,
} as const;

/**
 * Animation configurations for glass effects
 */
export const glassAnimations = {
  // Standard transition duration
  transitionDuration: 200,

  // Smooth easing
  easing: 'ease-in-out' as const,

  // Hover/Press scale effect
  pressScale: 0.98,
  hoverScale: 1.02,

  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },

  // Slide animations
  slideUp: {
    from: { transform: [{ translateY: 20 }], opacity: 0 },
    to: { transform: [{ translateY: 0 }], opacity: 1 },
  },
  slideDown: {
    from: { transform: [{ translateY: -20 }], opacity: 0 },
    to: { transform: [{ translateY: 0 }], opacity: 1 },
  },

  // Scale animations
  scaleIn: {
    from: { transform: [{ scale: 0.95 }], opacity: 0 },
    to: { transform: [{ scale: 1 }], opacity: 1 },
  },
} as const;

export type GlassEffectType = keyof typeof glassEffects;

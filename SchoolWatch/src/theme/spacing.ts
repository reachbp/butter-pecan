/**
 * Sequoia Glass Spacing System
 * Based on 8px grid system
 */

// Base spacing unit: 8px
const BASE_UNIT = 8;

export const spacing = {
  // Core spacing scale (multiples of 8)
  xs: BASE_UNIT * 0.5,      // 4px
  sm: BASE_UNIT,            // 8px
  md: BASE_UNIT * 2,        // 16px
  lg: BASE_UNIT * 3,        // 24px
  xl: BASE_UNIT * 4,        // 32px
  '2xl': BASE_UNIT * 5,     // 40px
  '3xl': BASE_UNIT * 6,     // 48px
  '4xl': BASE_UNIT * 8,     // 64px
  '5xl': BASE_UNIT * 10,    // 80px

  // Pixel-specific values for common uses
  none: 0,
  px: 1,

  // Screen padding
  screenHorizontal: BASE_UNIT * 2.5,  // 20px
  screenVertical: BASE_UNIT * 3,      // 24px

  // Card spacing
  cardPadding: BASE_UNIT * 2,         // 16px
  cardMargin: BASE_UNIT * 1.5,        // 12px
  cardGap: BASE_UNIT * 2,             // 16px

  // Component spacing
  buttonPadding: {
    vertical: BASE_UNIT * 1.5,        // 12px
    horizontal: BASE_UNIT * 3,        // 24px
  },
  inputPadding: {
    vertical: BASE_UNIT * 1.5,        // 12px
    horizontal: BASE_UNIT * 2,        // 16px
  },

  // Section spacing
  sectionGap: BASE_UNIT * 3,          // 24px
  sectionMargin: BASE_UNIT * 4,       // 32px
} as const;

// Border Radius (also based on 8px grid)
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// Shadows for glass effects
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  popover: 1300,
  toast: 1400,
  tooltip: 1500,
} as const;

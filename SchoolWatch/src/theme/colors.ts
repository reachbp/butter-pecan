/**
 * Sequoia Glass Color Palette
 * Inspired by macOS Sequoia's glass effects
 */

export const colors = {
  // Primary Colors
  primary: {
    main: '#1B4332',      // Deep forest green
    light: '#2D5F4A',
    dark: '#0F2419',
    contrast: '#FFFFFF',
  },

  // Secondary/Accent
  secondary: {
    main: '#F4A261',      // Warm gold accent
    light: '#F7B77F',
    dark: '#E68B3D',
    contrast: '#1B4332',
  },

  // Glass Effects
  glass: {
    white: 'rgba(255, 255, 255, 0.2)',
    whiteStrong: 'rgba(255, 255, 255, 0.3)',
    whiteLight: 'rgba(255, 255, 255, 0.1)',
    gray: 'rgba(245, 245, 247, 0.2)',
    grayStrong: 'rgba(245, 245, 247, 0.3)',
    dark: 'rgba(0, 0, 0, 0.15)',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },

  // Status Colors
  status: {
    success: '#52B788',   // Success green
    warning: '#F9C74F',   // Warning amber
    error: '#EF476F',     // Error red
    info: '#4895EF',      // Info blue
    pending: '#9D8DF1',   // Pending purple
  },

  // Semantic Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F7',
    tertiary: '#E8E8EA',
    dark: '#1C1C1E',
  },

  text: {
    primary: '#1C1C1E',
    secondary: '#6E6E73',
    tertiary: '#A1A1A6',
    disabled: '#C7C7CC',
    inverse: '#FFFFFF',
  },

  border: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    strong: 'rgba(0, 0, 0, 0.2)',
  },

  // Application Status Colors (for school applications)
  applicationStatus: {
    considering: '#A1A1A6',  // Gray
    applied: '#4895EF',       // Blue
    interviewed: '#F9C74F',   // Amber
    accepted: '#52B788',      // Green
    waitlisted: '#F4A261',    // Orange
    rejected: '#EF476F',      // Red
    decided: '#1B4332',       // Primary green
  },
} as const;

export type ColorTheme = typeof colors;

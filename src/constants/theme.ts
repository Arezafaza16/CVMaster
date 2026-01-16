// CV Master - Theme Configuration
// Professional color palette with Deep Blue primary

export const colors = {
    // Primary palette - Corporate Deep Blue
    primary: '#1e40af',        // Corporate Deep Blue - main brand color
    primaryDark: '#172554',    // Darker blue for gradients
    primaryLight: '#3b82f6',   // Lighter blue

    // Secondary palette - Slate grays
    secondary: '#64748b',      // Slate 500
    secondaryDark: '#475569',  // Slate 600
    secondaryLight: '#94a3b8', // Slate 400

    // Accent colors - Green and Orange
    accent: '#10b981',         // Emerald/Green accent
    accentAlt: '#f97316',      // Orange accent
    accentOrangeLight: '#fed7aa', // Light orange

    // Score colors
    scoreHigh: '#10b981',      // Green - High score (80+)
    scoreMedium: '#f97316',    // Orange - Medium score (50-79)
    scoreLow: '#ef4444',       // Red - Low score (<50)

    // Background colors (Light theme like reference)
    background: '#f8fafc',     // Very light slate - main bg
    surface: '#ffffff',        // White - cards
    surfaceLight: '#f1f5f9',   // Slate 100 - elevated elements
    headerGradientStart: '#172554',  // Dark blue for header gradient
    headerGradientEnd: '#1e40af',    // Primary blue for header gradient

    // Text colors (proper contrast)
    text: '#1e293b',           // Slate 800 - primary text
    textSecondary: '#64748b',  // Slate 500 - secondary text
    textMuted: '#94a3b8',      // Slate 400 - muted text
    textOnPrimary: '#ffffff',  // White text on blue backgrounds
    textOnPrimaryMuted: '#bfdbfe', // Light blue text on blue backgrounds

    // Status colors
    success: '#10b981',        // Emerald
    warning: '#f97316',        // Orange
    error: '#ef4444',          // Red
    info: '#3b82f6',           // Blue

    // Other
    border: '#e2e8f0',         // Slate 200
    divider: '#f1f5f9',        // Slate 100
    overlay: 'rgba(23, 37, 84, 0.5)',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
};

export const gradients = {
    primary: ['#172554', '#1e40af'],    // Dark to Light blue (header gradient)
    secondary: ['#f8fafc', '#f1f5f9'],  // Light slate
    success: ['#10b981', '#34d399'],    // Emerald
    warning: ['#f97316', '#fb923c'],    // Orange
    error: ['#ef4444', '#f87171'],      // Red
    dark: ['#172554', '#1e40af'],       // Deep blue
    card: ['#ffffff', '#f8fafc'],       // White to light
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const fontSize = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
    display: 40,
};

export const fontWeight = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    glow: {
        shadowColor: '#1E3A5F',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 12,
    },
};

// Glassmorphism effect (light theme)
export const glass = {
    background: 'rgba(255, 255, 255, 0.8)',
    border: 'rgba(30, 58, 95, 0.1)',
    blur: 10,
};

const theme = {
    colors,
    gradients,
    spacing,
    borderRadius,
    fontSize,
    fontWeight,
    shadows,
    glass,
};

export default theme;

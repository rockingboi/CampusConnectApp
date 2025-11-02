/**
 * Gen Z Era Color Palette - Vibrant and Modern
 */

import { Platform } from 'react-native';

const tintColorLight = '#6366f1'; // Indigo
const tintColorDark = '#a855f7'; // Purple

export const Colors = {
  light: {
    text: '#0f172a',
    background: '#f8fafc',
    tint: tintColorLight,
    icon: '#64748b',
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
    // Gen Z Gradient Colors
    gradient1: '#6366f1', // Indigo
    gradient2: '#8b5cf6', // Purple
    gradient3: '#ec4899', // Pink
    gradient4: '#f59e0b', // Amber
    // Accent Colors
    accent: '#ec4899',
    success: '#10b981',
    warning: '#f59e0b',
    cardBg: '#ffffff',
    cardShadow: 'rgba(99, 102, 241, 0.1)',
  },
  dark: {
    text: '#f1f5f9',
    background: '#0f172a',
    tint: tintColorDark,
    icon: '#94a3b8',
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorDark,
    // Gen Z Gradient Colors (darker variants)
    gradient1: '#6366f1',
    gradient2: '#8b5cf6',
    gradient3: '#ec4899',
    gradient4: '#f59e0b',
    // Accent Colors
    accent: '#ec4899',
    success: '#10b981',
    warning: '#f59e0b',
    cardBg: '#1e293b',
    cardShadow: 'rgba(139, 92, 246, 0.2)',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

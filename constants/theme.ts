/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const ThemeColors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// App-wide color palette
export const Colors = {
  // Brand
  primary: '#00afa1',        // teal - main brand color
  primaryAlt: '#00A8FF',     // blue accent used on home screen

  // Text
  textDark: '#1A202C',       // headings, primary text
  textBody: '#2D3748',       // body text, section titles
  textMedium: '#4A5568',     // secondary text
  textMuted: '#718096',      // labels, hints
  textLight: '#A0AEC0',      // placeholders, empty states

  // Backgrounds
  backgroundLight: '#F8FAFC', // light page background
  backgroundGray: '#f5f5f5',  // slightly darker gray background
  backgroundMuted: '#f8f8f8', // muted sections
  white: '#FFFFFF',

  // Borders
  border: '#e0e0e0',
  borderLight: '#e8e8e8',
  borderSubtle: '#f0f0f0',

  // Status / semantic
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  dangerLight: '#ff6b6b',
  info: '#3498DB',
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

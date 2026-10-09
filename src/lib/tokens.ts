/**
 * Pakizzle Design System - Type-Safe Semantic Tokens
 */

export const THEME_TOKENS = {
  light: {
    bgPage: "#FAF3E6",
    bgSurface: "#FFFFFF",
    bgRaised: "#FFFFFF",
    bgInset: "#F2EBE0",
    textPrimary: "#1D1D1F",
    textSecondary: "#59595E",
    border: "rgba(91, 42, 134, 0.10)",
    borderSubtle: "rgba(91, 42, 134, 0.06)",
    accent: "#5B2A86",
    accentHover: "#4B2270",
    accentText: "#5B2A86",
    focusRing: "#5B2A86",
    success: "#1E7A38",
    warning: "#9A4800",
    danger: "#C53030",
    goldDecoration: "#C9A227",
  },
  dark: {
    bgPage: "#000000",
    bgSurface: "#111113",
    bgRaised: "#1C1C1E",
    bgInset: "#2C2C2E",
    textPrimary: "#F5F5F7",
    textSecondary: "#98989D",
    border: "rgba(255, 255, 255, 0.10)",
    borderSubtle: "rgba(255, 255, 255, 0.06)",
    accent: "#B18CE6",
    accentHover: "#C4A5F0",
    accentText: "#B18CE6",
    focusRing: "#B18CE6",
    success: "#4ADE80",
    warning: "#FBBF24",
    danger: "#F87171",
    goldDecoration: "#C9A227",
  },
} as const;

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

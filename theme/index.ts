/**
 * ============================================================================
 * Theme
 * ----------------------------------------------------------------------------
 * Exposes the application's theme objects and design system modules.
 * ============================================================================
 */

import { darkColors, lightColors } from "./colors";

export * from "./colors";
export * from "./spacing";
export * from "./typography";
export * from "./radius";
export * from "./shadows";

export const lightTheme = {
    colors: lightColors,
};

export const darkTheme = {
    colors: darkColors,
};
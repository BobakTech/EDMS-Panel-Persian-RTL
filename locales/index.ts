/**
 * ============================================================================
 * Localization
 * ----------------------------------------------------------------------------
 * Exposes the application's translation resources.
 * ============================================================================
 */

import en from "./en";
import fa from "./fa";
export type { TranslationKey } from "./fa";

export const translations = {
    fa,
    en,
};

export type Language = keyof typeof translations;
export type LayoutDirection = "rtl" | "ltr";

export const languageDirections: Record<Language, LayoutDirection> = {
    fa: "rtl",
    en: "ltr",
};

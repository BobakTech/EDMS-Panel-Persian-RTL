/**
 * ============================================================================
 * Localization
 * ----------------------------------------------------------------------------
 * Exposes the application's translation resources.
 * ============================================================================
 */

import en from "./en";
import fa from "./fa";

export const translations = {
    fa,
    en,
};

export type Language = keyof typeof translations;
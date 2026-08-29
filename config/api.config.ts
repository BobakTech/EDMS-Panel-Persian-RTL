/**
 * Shared API configuration.
 *
 * Provides the base endpoint used by service layers.
 * Environment-specific values must stay outside source code.
 */

export const apiConfig = {
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
};
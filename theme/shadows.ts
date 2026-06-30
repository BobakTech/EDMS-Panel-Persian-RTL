/**
 * ============================================================================
 * Shadows
 * ----------------------------------------------------------------------------
 * Centralized shadow definitions used throughout the application.
 * ============================================================================
 */

import { ViewStyle } from "react-native";

export const shadows: Record<string, ViewStyle> = {
    none: {},

    sm: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 2,

        elevation: 1,
    },

    md: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.12,
        shadowRadius: 6,

        elevation: 3,
    },

    lg: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.16,
        shadowRadius: 12,

        elevation: 6,
    },
} as const;
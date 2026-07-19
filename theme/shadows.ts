/**
 * ============================================================================
 * Shadows
 * ----------------------------------------------------------------------------
 * Defines cross-platform shadow presets for the EDMS panel.
 * Uses boxShadow on web and native shadow/elevation props elsewhere.
 * ============================================================================
 */

import {
    Platform,
    type ViewStyle,
} from "react-native";

/**
 * ============================================================================
 * Types
 * ============================================================================
 */

type ShadowSize = "sm" | "md" | "lg";

type ShadowPresetMap = Record<ShadowSize, ViewStyle>;

/**
 * ============================================================================
 * Web Shadows
 * ============================================================================
 */

const webShadows: ShadowPresetMap = {
    sm: {
        boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.08)",
    },
    md: {
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.12)",
    },
    lg: {
        boxShadow: "0px 8px 12px rgba(0, 0, 0, 0.16)",
    },
};

/**
 * ============================================================================
 * Native Shadows
 * ============================================================================
 */

const nativeShadows: ShadowPresetMap = {
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
            height: 4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
    },
    lg: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.16,
        shadowRadius: 12,
        elevation: 6,
    },
};

/**
 * ============================================================================
 * Export
 * ============================================================================
 */

export const shadows: ShadowPresetMap =
    Platform.OS === "web" ? webShadows : nativeShadows;

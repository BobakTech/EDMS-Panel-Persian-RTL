/**
 * ============================================================================
 * Workspace View Controls
 * ----------------------------------------------------------------------------
 * Displays controls for switching workspace view modes.
 * ============================================================================
 */

import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

import type { WorkspaceViewMode } from "./workspace.types";

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface WorkspaceViewControlsProps {
    viewMode: WorkspaceViewMode;
    onChangeViewMode: (mode: WorkspaceViewMode) => void;
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function WorkspaceViewControls({
    viewMode,
    onChangeViewMode,
}: WorkspaceViewControlsProps) {
    const { theme } = useSettings();
    const colors = theme.colors;

    const isGridActive = viewMode === "grid";
    const isListActive = viewMode === "list";

    return (
        <View style={styles.container}>
            <Pressable
                accessibilityRole="button"
                accessibilityState={{
                    selected: isGridActive,
                }}
                onPress={() => onChangeViewMode("grid")}
                style={[
                    styles.button,
                    {
                        backgroundColor: isGridActive
                            ? colors.background
                            : colors.surface,
                        borderColor: isGridActive
                            ? colors.primary
                            : colors.border,
                    },
                ]}
            >
                <Text style={[
                    styles.buttonText,
                    {
                        color: isGridActive
                            ? colors.primary
                            : colors.text,
                    },
                ]}>
                    شبکه‌ای
                </Text>
            </Pressable>

            <Pressable
                accessibilityRole="button"
                accessibilityState={{
                    selected: isListActive,
                }}
                onPress={() => onChangeViewMode("list")}
                style={[
                    styles.button,
                    {
                        backgroundColor: isListActive
                            ? colors.background
                            : colors.surface,
                        borderColor: isListActive
                            ? colors.primary
                            : colors.border,
                    },
                ]}
            >
                <Text style={[
                    styles.buttonText,
                    {
                        color: isListActive
                            ? colors.primary
                            : colors.text,
                    },
                ]}>
                    فهرستی
                </Text>
            </Pressable>
        </View>
    );
}

/**
 * ============================================================================
 * Styles
 * ============================================================================
 */

const styles = StyleSheet.create({
    container: {
        flexDirection: "row-reverse",
        alignItems: "center",

        gap: spacing.sm,
    },

    button: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,

        borderWidth: 1,
        borderRadius: radius.md,
    },

    buttonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
});
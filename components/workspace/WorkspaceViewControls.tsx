/**
 * ============================================================================
 * Workspace View Controls
 * ----------------------------------------------------------------------------
 * Switches workspace items between card and list views with compact icon buttons.
 * ============================================================================
 */

import { Feather } from "../../web/icons";

import {
    Pressable,
    StyleSheet,
    View,
} from "../../web/ui";

import { radius, spacing } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

import type { WorkspaceViewMode } from "./workspace.types";

/**
 * ============================================================================
 * Types
 * ============================================================================
 */

type FeatherIconName = keyof typeof Feather.glyphMap;

interface ViewModeConfig {
    mode: WorkspaceViewMode;
    icon: FeatherIconName;
    accessibilityLabel: string;
}

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
 * View Modes
 * ============================================================================
 */

const viewModes: ViewModeConfig[] = [
    {
        mode: "grid",
        icon: "grid",
        accessibilityLabel: "نمایش کارت‌ها",
    },
    {
        mode: "list",
        icon: "list",
        accessibilityLabel: "نمایش فهرست",
    },
];

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

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                },
            ]}
        >
            {viewModes.map((item) => {
                const isSelected = viewMode === item.mode;

                return (
                    <Pressable
                        key={item.mode}
                        accessibilityRole="button"
                        accessibilityLabel={item.accessibilityLabel}
                        accessibilityState={{
                            selected: isSelected,
                        }}
                        onPress={() => onChangeViewMode(item.mode)}
                        style={({ pressed }) => [
                            styles.button,
                            {
                                backgroundColor: isSelected
                                    ? colors.surface
                                    : colors.background,
                                borderColor: isSelected
                                    ? colors.primary
                                    : colors.border,
                            },
                            pressed && styles.pressedButton,
                        ]}
                    >
                        <Feather
                            name={item.icon}
                            size={18}
                            color={isSelected ? colors.primary : colors.text}
                        />
                    </Pressable>
                );
            })}
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
        flexDirection: "row",
        alignItems: "center",

        padding: 3,

        borderWidth: 1,
        borderRadius: radius.lg,

        gap: 3,
    },

    button: {
        width: 34,
        height: 34,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.md,
    },

    pressedButton: {
        opacity: 0.82,
    },
});

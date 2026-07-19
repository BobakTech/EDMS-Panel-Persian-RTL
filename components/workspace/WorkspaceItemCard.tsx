/**
 * ============================================================================
 * Workspace Item Card
 * ----------------------------------------------------------------------------
 * Displays a single workspace item such as a folder or file.
 * ============================================================================
 */

import { Feather } from "@expo/vector-icons";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

import {
    getWorkspaceItemLabel,
    getWorkspaceItemUpdatedAtLabel,
} from "./workspace.helpers";

import type { Language } from "../../locales";

import type {
    WorkspaceItem,
    WorkspaceViewMode,
} from "./workspace.types";

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface WorkspaceItemCardProps {
    item: WorkspaceItem;
    viewMode: WorkspaceViewMode;
    isCompact: boolean;
    isSelected: boolean;
    onPress: (itemId: string) => void;
}

/**
 * ============================================================================
 * Helpers
 * ============================================================================
 */

type FeatherIconName = keyof typeof Feather.glyphMap;

function getWorkspaceIconName(item: WorkspaceItem): FeatherIconName {
    return item.type === "folder" ? "folder" : "file-text";
}

function getWorkspaceVisualLabel(
    item: WorkspaceItem,
    language: Language
) {
    if (item.type === "file") {
        return getWorkspaceItemLabel(item);
    }

    return language === "fa" ? "پوشه" : "Folder";
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function WorkspaceItemCard({
    item,
    viewMode,
    isCompact,
    isSelected,
    onPress,
}: WorkspaceItemCardProps) {
    const { theme, language } = useSettings();
    const colors = theme.colors;

    const isListMode = viewMode === "list";

    const visualLabel = getWorkspaceVisualLabel(item, language);

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.name}
            accessibilityState={{
                selected: isSelected,
            }}
            onPress={() => onPress(item.id)}
            style={({ pressed }) => [
                styles.card,
                isListMode
                    ? styles.listCard
                    : styles.gridCard,
                !isListMode && isCompact && styles.compactGridCard,
                pressed && styles.pressedCard,
                {
                    backgroundColor: isSelected
                        ? colors.background
                        : colors.surface,
                    borderColor: isSelected
                        ? colors.primary
                        : colors.border,
                },
            ]}
        >
            <View
                style={[
                    styles.visualArea,
                    isListMode
                        ? styles.listVisualArea
                        : styles.gridVisualArea,
                ]}
            >
                <Feather
                    name={getWorkspaceIconName(item)}
                    size={isListMode ? 24 : 28}
                    color={colors.primary}
                />

                <View
                    style={[
                        styles.visualLabel,
                        isListMode
                            ? styles.listVisualLabel
                            : styles.gridVisualLabel,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.visualLabelText,
                            {
                                color: colors.primary,
                            },
                        ]}
                    >
                        {visualLabel}
                    </Text>
                </View>
            </View>

            <View style={styles.textContent}>
                <Text
                    style={[
                        styles.title,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    {item.name}
                </Text>

                <Text
                    style={[
                        styles.description,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    {item.description}
                </Text>

                <Text
                    style={[
                        styles.meta,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    {getWorkspaceItemUpdatedAtLabel(item)}
                </Text>
            </View>
        </Pressable>
    );
}

/**
 * ============================================================================
 * Styles
 * ============================================================================
 */

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: radius.lg,
    },

    pressedCard: {
        opacity: 0.72,
    },

    gridCard: {
        width: 240,

        gap: spacing.md,

        padding: spacing.lg,
    },

    compactGridCard: {
        width: "100%",
    },

    listCard: {
        width: "100%",
        minHeight: 96,

        flexDirection: "row-reverse",
        alignItems: "center",

        gap: spacing.lg,

        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },

    visualArea: {
        alignItems: "center",
        justifyContent: "center",
    },

    gridVisualArea: {
        alignSelf: "flex-end",

        flexDirection: "row-reverse",

        gap: spacing.sm,
    },

    listVisualArea: {
        width: 76,

        gap: spacing.xs,
    },

    visualLabel: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,

        borderWidth: 1,
        borderRadius: radius.pill,
    },

    gridVisualLabel: {
        alignSelf: "center",
    },

    listVisualLabel: {
        alignSelf: "center",
    },

    visualLabelText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "center",
    },

    textContent: {
        flex: 1,
    },

    title: {
        marginBottom: spacing.xs,

        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    description: {
        marginBottom: spacing.sm,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",

        opacity: 0.64,
    },

    meta: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        textAlign: "right",

        opacity: 0.56,
    },
});

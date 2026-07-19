/**
 * ============================================================================
 * Workspace Item Card
 * ----------------------------------------------------------------------------
 * Displays a single workspace item such as a folder or file.
 * ============================================================================
 */

import { Feather } from "@expo/vector-icons";

import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

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
    onOpenActions?: (itemId: string) => void;
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
    onOpenActions,
}: WorkspaceItemCardProps) {
    const { theme, language } = useSettings();
    const colors = theme.colors;

    const isListMode = viewMode === "list";
    const visualLabel = getWorkspaceVisualLabel(item, language);

    return (
        <View
            style={[
                styles.card,
                isListMode
                    ? styles.listCard
                    : styles.gridCard,
                !isListMode && isCompact && styles.compactGridCard,
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
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.name}
                accessibilityState={{
                    selected: isSelected,
                }}
                onPress={() => onPress(item.id)}
                style={({ pressed }) => [
                    styles.cardPressArea,
                    isListMode
                        ? styles.listPressArea
                        : styles.gridPressArea,
                    pressed && styles.pressedCardContent,
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

            {onOpenActions && (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`عملیات ${item.name}`}
                    onPress={() => onOpenActions(item.id)}
                    style={({ pressed }) => [
                        styles.actionsButton,
                        pressed && styles.pressedCardContent,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Feather
                        name="more-horizontal"
                        size={18}
                        color={isSelected ? colors.primary : colors.text}
                    />
                </Pressable>
            )}
        </View>
    );
}

/**
 * ============================================================================
 * Styles
 * ============================================================================
 */

const styles = StyleSheet.create({
    card: {
        position: "relative",

        overflow: "hidden",

        borderWidth: 1,
        borderRadius: radius.lg,
    },

    gridCard: {
        width: 240,
    },

    compactGridCard: {
        width: "100%",
    },

    listCard: {
        width: "100%",
        minHeight: 96,
    },

    cardPressArea: {
        flex: 1,
    },

    gridPressArea: {
        gap: spacing.md,

        padding: spacing.lg,
        paddingLeft: spacing.xxl,
    },

    listPressArea: {
        flexDirection: "row-reverse",
        alignItems: "center",

        gap: spacing.lg,

        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        paddingLeft: spacing.xxl,
    },

    pressedCardContent: {
        opacity: 0.72,
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

    actionsButton: {
        position: "absolute",
        top: spacing.sm,
        left: spacing.sm,

        width: 30,
        height: 30,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.pill,
    },
});

/**
 * ============================================================================
 * Workspace Item Card
 * ----------------------------------------------------------------------------
 * Displays a single workspace item such as a folder or file.
 * ============================================================================
 */

import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

import { getWorkspaceItemLabel } from "./workspace.helpers";

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
    const { theme } = useSettings();
    const colors = theme.colors;

    const isListMode = viewMode === "list";

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{
                selected: isSelected,
            }}
            onPress={() => onPress(item.id)}
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
            <View style={[
                styles.icon,
                isListMode
                    ? styles.listIcon
                    : styles.gridIcon,
                {
                    backgroundColor: colors.background,
                    borderColor: isSelected
                        ? colors.primary
                        : colors.border,
                },
            ]}>
                <Text style={[
                    styles.iconText,
                    {
                        color: colors.primary,
                    },
                ]}>
                    {getWorkspaceItemLabel(item.type)}
                </Text>
            </View>

            <View style={styles.textContent}>
                <Text style={[
                    styles.title,
                    {
                        color: colors.text,
                    },
                ]}>
                    {item.name}
                </Text>

                <Text style={[
                    styles.description,
                    {
                        color: colors.text,
                    },
                ]}>
                    {item.description}
                </Text>

                <Text style={[
                    styles.meta,
                    {
                        color: colors.text,
                    },
                ]}>
                    {item.updatedAt}
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
        padding: spacing.lg,

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
        minHeight: 112,

        flexDirection: "row-reverse",
        alignItems: "center",
    },

    icon: {
        width: 48,
        height: 48,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.lg,
    },

    gridIcon: {
        alignSelf: "flex-end",

        marginBottom: spacing.md,
    },

    listIcon: {
        marginLeft: spacing.lg,
    },

    iconText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
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
        marginBottom: spacing.md,

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
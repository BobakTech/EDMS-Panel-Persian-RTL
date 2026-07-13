/**
 * ============================================================================
 * Workspace Item Details Panel
 * ----------------------------------------------------------------------------
 * Displays metadata and quick information for the selected workspace item.
 * ============================================================================
 */

import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

import {
    getWorkspaceItemLabel,
    getWorkspaceItemUpdatedAtLabel,
} from "./workspace.helpers";

import type { WorkspaceItem } from "./workspace.types";

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface WorkspaceItemDetailsPanelProps {
    item: WorkspaceItem;
    onClose: () => void;
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function WorkspaceItemDetailsPanel({
    item,
    onClose,
}: WorkspaceItemDetailsPanelProps) {
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
            <View style={styles.content}>
                <Text
                    style={[
                        styles.label,
                        {
                            color: colors.primary,
                        },
                    ]}
                >
                    {getWorkspaceItemLabel(item)}
                </Text>

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

                <View style={styles.metaRow}>
                    <Text
                        style={[
                            styles.metaText,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        وضعیت: {item.status === "active" ? "فعال" : "آرشیو"}
                    </Text>

                    <Text
                        style={[
                            styles.metaText,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {getWorkspaceItemUpdatedAtLabel(item)}
                    </Text>
                </View>
            </View>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="بستن جزئیات"
                onPress={onClose}
                style={[
                    styles.closeButton,
                    {
                        borderColor: colors.border,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.closeButtonText,
                        {
                            color: colors.primary,
                        },
                    ]}
                >
                    بستن
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

        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.lg,
    },

    content: {
        flex: 1,
    },

    label: {
        marginBottom: spacing.xs,

        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    title: {
        marginBottom: spacing.xs,

        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    description: {
        marginBottom: spacing.xs,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",

        opacity: 0.72,
    },

    metaRow: {
        flexDirection: "row-reverse",
        alignItems: "center",

        gap: spacing.md,
    },

    metaText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,

        opacity: 0.64,
    },

    closeButton: {
        marginRight: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.md,
    },

    closeButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },
});
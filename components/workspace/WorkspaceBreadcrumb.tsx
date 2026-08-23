/**
 * ============================================================================
 * Workspace Breadcrumb
 * ----------------------------------------------------------------------------
 * Displays clean, clickable breadcrumb navigation for workspace pages.
 * ============================================================================
 */

import { Pressable, StyleSheet, Text, View } from "../../web/ui";

import { spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";

/**
 * ============================================================================
 * Types
 * ============================================================================
 */

export interface WorkspaceBreadcrumbItem {
    label: string;
    accessibilityLabel?: string;
    onPress?: () => void;
}

interface WorkspaceBreadcrumbProps {
    items: WorkspaceBreadcrumbItem[];
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function WorkspaceBreadcrumb({
    items,
}: WorkspaceBreadcrumbProps) {
    const { direction, theme } = useSettings();
    const colors = theme.colors;
    const { textAlign } = getDirectionalLayout(direction);

    return (
        <View style={[styles.container, { direction }]}>
            {items.map((item, index) => {
                const isLastItem = index === items.length - 1;
                const isClickable = Boolean(item.onPress);

                return (
                    <View
                        key={`${item.label}-${index}`}
                        style={styles.itemGroup}
                    >
                        {isClickable ? (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={
                                    item.accessibilityLabel ?? item.label
                                }
                                hitSlop={8}
                                onPress={item.onPress}
                                style={styles.itemButton}
                            >
                                <Text
                                    style={[
                                        styles.itemText,
                                        styles.clickableItemText,
                                        {
                                            color: colors.primary,
                                            textAlign,
                                        },
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </Pressable>
                        ) : (
                            <View style={styles.currentItem}>
                                <Text
                                    style={[
                                        styles.itemText,
                                        styles.currentItemText,
                                        {
                                            color: colors.text,
                                            textAlign,
                                        },
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </View>
                        )}

                        {!isLastItem && (
                            <Text
                                style={[
                                    styles.separator,
                                    {
                                        color: colors.border,
                                    },
                                ]}
                            >
                                /
                            </Text>
                        )}
                    </View>
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
        flexWrap: "wrap",

        gap: spacing.xs,
    },

    itemGroup: {
        flexDirection: "row",
        alignItems: "center",

        gap: spacing.xs,
    },

    itemButton: {
        paddingVertical: spacing.xs,
    },

    currentItem: {
        paddingVertical: spacing.xs,
    },

    itemText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        textAlign: "right",
    },

    clickableItemText: {
        fontWeight: typography.fontWeight.semibold,
    },

    currentItemText: {
        fontWeight: typography.fontWeight.semibold,
    },

    separator: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
});

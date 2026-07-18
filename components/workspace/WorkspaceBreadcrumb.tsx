/**
 * ============================================================================
 * Workspace Breadcrumb
 * ----------------------------------------------------------------------------
 * Displays clickable breadcrumb navigation for workspace pages and folders.
 * ============================================================================
 */

import { Pressable, StyleSheet, Text, View } from "react-native";

import { spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

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
    const { theme } = useSettings();
    const colors = theme.colors;

    return (
        <View style={styles.container}>
            {items.map((item, index) => {
                const isLastItem = index === items.length - 1;
                const isClickable = !isLastItem && Boolean(item.onPress);

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
                                onPress={item.onPress}
                                style={styles.itemButton}
                            >
                                <Text
                                    style={[
                                        styles.itemText,
                                        styles.clickableItemText,
                                        {
                                            color: colors.primary,
                                        },
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </Pressable>
                        ) : (
                            <Text
                                style={[
                                    styles.itemText,
                                    {
                                        color: isLastItem
                                            ? colors.text
                                            : colors.primary,
                                        opacity: isLastItem ? 1 : 0.72,
                                    },
                                ]}
                            >
                                {item.label}
                            </Text>
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
        flexDirection: "row-reverse",
        alignItems: "center",
        alignSelf: "flex-start",
        flexWrap: "wrap",

        marginBottom: spacing.md,

        gap: spacing.xs,
    },

    itemGroup: {
        flexDirection: "row-reverse",
        alignItems: "center",

        gap: spacing.xs,
    },

    itemButton: {
        paddingVertical: spacing.xs,
    },

    itemText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        textAlign: "right",
    },

    clickableItemText: {
        textDecorationLine: "underline",
    },

    separator: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
});

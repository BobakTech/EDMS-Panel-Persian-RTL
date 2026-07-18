/**
 * ============================================================================
 * Workspace Empty State
 * ----------------------------------------------------------------------------
 * Displays the empty state when the workspace has no folders or files.
 * ============================================================================
 */

import { StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

interface WorkspaceEmptyStateProps {
    title?: string;
    description?: string;
    icon?: string;
    showHints?: boolean;
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function WorkspaceEmptyState({
    title = "هنوز سندی وجود ندارد",
    description = "برای شروع، یک پوشه جدید بسازید یا فایل‌های خود را بارگذاری کنید.",
    icon = "+",
    showHints = true,
}: WorkspaceEmptyStateProps) {
    const { theme } = useSettings();
    const colors = theme.colors;

    return (
        <View style={styles.emptyState}>
            <View style={[
                styles.icon,
                {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                },
            ]}>
                <Text style={[
                    styles.iconText,
                    {
                        color: colors.primary,
                    },
                ]}>
                    {icon}
                </Text>
            </View>

            <Text style={[
                styles.title,
                {
                    color: colors.text,
                },
            ]}>
                {title}
            </Text>

            <Text style={[
                styles.description,
                {
                    color: colors.text,
                },
            ]}>
                {description}
            </Text>

            {showHints && (
                <View style={styles.hints}>
                    <View
                        style={[
                            styles.hintChip,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.hintChipText,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            پوشه جدید
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.hintChip,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.hintChipText,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            بارگذاری فایل
                        </Text>
                    </View>
                </View>
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
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: spacing.xxl,
    },

    icon: {
        width: 64,
        height: 64,

        alignItems: "center",
        justifyContent: "center",

        marginBottom: spacing.lg,

        borderWidth: 1,
        borderRadius: radius.xl,
    },

    iconText: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.medium,
    },

    title: {
        marginBottom: spacing.sm,

        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
    },

    description: {
        maxWidth: 420,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "center",

        opacity: 0.64,
    },

    hints: {
        flexDirection: "row-reverse",
        alignItems: "center",

        marginTop: spacing.lg,

        gap: spacing.sm,
    },

    hintChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,

        borderWidth: 1,
        borderRadius: radius.pill,
    },

    hintChipText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
    },
});

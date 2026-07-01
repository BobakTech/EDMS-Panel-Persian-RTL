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

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function WorkspaceEmptyState() {
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
                    +
                </Text>
            </View>

            <Text style={[
                styles.title,
                {
                    color: colors.text,
                },
            ]}>
                هنوز سندی وجود ندارد
            </Text>

            <Text style={[
                styles.description,
                {
                    color: colors.text,
                },
            ]}>
                برای شروع، یک پوشه جدید بسازید یا فایل‌های خود را بارگذاری کنید.
            </Text>
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
});
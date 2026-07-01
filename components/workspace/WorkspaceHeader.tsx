/**
 * ============================================================================
 * Workspace Header
 * ----------------------------------------------------------------------------
 * Displays the workspace title, subtitle, and optional header actions.
 * ============================================================================
 */

import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface WorkspaceHeaderProps {
    title: string;
    subtitle: string;
    children?: ReactNode;
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function WorkspaceHeader({
    title,
    subtitle,
    children,
}: WorkspaceHeaderProps) {
    const { theme } = useSettings();
    const colors = theme.colors;

    return (
        <View style={styles.container}>
            <View style={styles.textContent}>
                <Text style={[
                    styles.title,
                    {
                        color: colors.text,
                    },
                ]}>
                    {title}
                </Text>

                <Text style={[
                    styles.subtitle,
                    {
                        color: colors.text,
                    },
                ]}>
                    {subtitle}
                </Text>
            </View>

            {children}
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
        justifyContent: "space-between",
        flexWrap: "wrap",

        gap: spacing.md,
        marginBottom: spacing.xl,
    },

    textContent: {
        flexShrink: 1,
    },

    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
    },

    subtitle: {
        marginTop: spacing.xs,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,

        opacity: 0.64,
    },
});
/**
 * ============================================================================
 * Workspace Header
 * ----------------------------------------------------------------------------
 * Displays the workspace title, subtitle, and compact inline header actions.
 * ============================================================================
 */

import type { ReactNode } from "react";

import {
    StyleSheet,
    Text,
    View,
} from "react-native";

import { spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

interface WorkspaceHeaderProps {
    title: string;
    subtitle: string;
    children?: ReactNode;
}

export default function WorkspaceHeader({
    title,
    subtitle,
    children,
}: WorkspaceHeaderProps) {
    const { theme } = useSettings();
    const colors = theme.colors;

    return (
        <View style={styles.container}>
            <View style={styles.textArea}>
                <Text
                    style={[
                        styles.title,
                        {
                            color: colors.text,
                        },
                    ]}
                    numberOfLines={1}
                >
                    {title}
                </Text>

                <Text
                    style={[
                        styles.subtitle,
                        {
                            color: colors.text,
                        },
                    ]}
                    numberOfLines={2}
                >
                    {subtitle}
                </Text>
            </View>

            {children && (
                <View style={styles.actions}>
                    {children}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "flex-start",

        gap: spacing.md,
    },

    textArea: {
        flexShrink: 1,
        minWidth: 0,

        alignItems: "flex-end",
    },

    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        textAlign: "right",
    },

    subtitle: {
        marginTop: spacing.xs,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",

        opacity: 0.64,
    },

    actions: {
        flexShrink: 0,

        alignItems: "center",
        justifyContent: "center",
    },
});

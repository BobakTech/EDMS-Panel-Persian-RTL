/**
 * ============================================================================
 * Workspace Breadcrumb
 * ----------------------------------------------------------------------------
 * Displays the current workspace navigation path.
 * ============================================================================
 */

import { Fragment } from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface WorkspaceBreadcrumbProps {
    items: string[];
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

                return (
                    <Fragment key={`${item}-${index}`}>
                        <Text style={[
                            styles.text,
                            isLastItem && styles.currentText,
                            {
                                color: colors.text,
                            },
                        ]}>
                            {item}
                        </Text>

                        {!isLastItem && (
                            <Text style={[
                                styles.separator,
                                {
                                    color: colors.border,
                                },
                            ]}>
                                /
                            </Text>
                        )}
                    </Fragment>
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

        marginBottom: spacing.md,
    },

    text: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,

        opacity: 0.64,
    },

    separator: {
        marginHorizontal: spacing.sm,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },

    currentText: {
        opacity: 1,
    },
});
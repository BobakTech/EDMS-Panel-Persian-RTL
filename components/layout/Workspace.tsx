/**
 * ============================================================================
 * Workspace
 * ----------------------------------------------------------------------------
 * Displays the main content area of the application.
 * ============================================================================
 */

import { StyleSheet, Text, View } from "react-native";
import { spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function Workspace() {
    const { theme } = useSettings();
    const colors = theme.colors;

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: colors.background,
            },
        ]}>
            <Text style={[
                styles.title,
                {
                    color: colors.text,
                },
            ]}>فضای کاری</Text>
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
        flex: 1,
        padding: spacing.xl,
    },

    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
    },
});
/**
 * ============================================================================
 * Sidebar
 * ----------------------------------------------------------------------------
 * Displays the application's navigation sidebar.
 * ============================================================================
 */

import { StyleSheet, Text, View } from "react-native";
import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function Sidebar() {
    const { theme } = useSettings();
    const colors = theme.colors;

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.surface,
                },
            ]}
        >
            {/* =========================================================================
            * Brand
            * ========================================================================= */}

            <View style={styles.brand}>
                {/* Logo Placeholder */}

                <View
                    style={[
                        styles.logoPlaceholder,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.logoPlaceholderText,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        Logo
                    </Text>
                </View>

                {/* Application Title */}

                <Text
                    style={[
                        styles.appTitle,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    EDMS
                </Text>

                {/* Application Subtitle */}

                <Text
                    style={[
                        styles.appSubtitle,
                        {
                            color: colors.border,
                        },
                    ]}
                >
                    Enterprise Document Management System
                </Text>
            </View>

            {/* =========================================================================
            * Navigation
            * ========================================================================= */}

            <View style={styles.navigation}>
                {/* Navigation Items */}

                {/* Dashboard */}

                <Text
                    style={[
                        styles.navigationItem,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    Dashboard
                </Text>

                {/* My Documents */}

                <Text
                    style={[
                        styles.navigationItem,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    My Documents
                </Text>

                {/* Shared Documents */}

                <Text
                    style={[
                        styles.navigationItem,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    Shared Documents
                </Text>

                {/* Archive */}

                <Text
                    style={[
                        styles.navigationItem,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    Archive
                </Text>
            </View>

            {/* =========================================================================
            * Utilities
            * ========================================================================= */}

            <View style={styles.utilities}>
                {/* Theme */}

                <Text
                    style={[
                        styles.utilityItem,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    🌙 Theme
                </Text>

                {/* Language */}

                <Text
                    style={[
                        styles.utilityItem,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    🌐 Language
                </Text>

                {/* Settings */}

                <Text
                    style={[
                        styles.utilityItem,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    ⚙️ Settings
                </Text>
            </View>
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
        width: spacing.sidebarWidth,
        padding: spacing.xl,

        borderRadius: radius.lg,

        ...shadows.md,
    },

    /**
     * ============================================================================
     * Shared
     * ============================================================================
     */

    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
    },

    /**
     * ============================================================================
     * Brand
     * ============================================================================
     */

    brand: {
        paddingBottom: spacing.xl,
    },

    logoPlaceholder: {
        width: 72,
        height: 72,

        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.lg,

        marginBottom: spacing.lg,
    },

    logoPlaceholderText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
    },

    appTitle: {
        textAlign: "center",

        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,

        marginBottom: spacing.sm,
    },

    appSubtitle: {
        textAlign: "center",

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
    },

    /**
     * ============================================================================
     * Navigation
     * ============================================================================
     */

    navigation: {
        flex: 1,
    },

    navigationItem: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.medium,

        paddingVertical: spacing.md,

        textAlign: "left",
    },

    /**
     * ============================================================================
     * Utilities
     * ============================================================================
     */

    utilities: {
        paddingTop: spacing.xl,
    },

    utilityItem: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,

        paddingVertical: spacing.sm,

        textAlign: "left",
    },
});
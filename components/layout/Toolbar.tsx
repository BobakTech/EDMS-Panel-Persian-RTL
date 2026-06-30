/**
 * ============================================================================
 * Toolbar
 * ----------------------------------------------------------------------------
 * Displays the application's top toolbar.
 * ============================================================================
 */

import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function Toolbar() {
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
 * User
 * ========================================================================= */}

            <View style={styles.user}>
                {/* Avatar */}

                <View
                    style={[
                        styles.avatar,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.avatarText,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        BT
                    </Text>
                </View>

                {/* User Information */}

                <View style={styles.userInfo}>
                    <Text
                        style={[
                            styles.userName,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        Bobak T.
                    </Text>

                    <Text
                        style={[
                            styles.userRole,
                            {
                                color: colors.border,
                            },
                        ]}
                    >
                        Software Developer
                    </Text>
                </View>
            </View>

            {/* =========================================================================
 * Actions
 * ========================================================================= */}

            <View style={styles.actions}>
                {/* Upload */}

                <Pressable
                    style={[
                        styles.actionButton,
                        {
                            backgroundColor: colors.primary,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.actionButtonText,
                            {
                                color: colors.surface,
                            },
                        ]}
                    >
                        Upload
                    </Text>
                </Pressable>

                {/* New Folder */}

                <Pressable
                    style={[
                        styles.actionButton,
                        {
                            backgroundColor: colors.primary,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.actionButtonText,
                            {
                                color: colors.surface,
                            },
                        ]}
                    >
                        New Folder
                    </Text>
                </Pressable>
            </View>

            {/* =========================================================================
            * Search
            * ========================================================================= */}

            <View style={styles.search}>
                {/* Search Input */}

                <TextInput
                    placeholder="Search..."
                    placeholderTextColor={colors.border}
                    style={[
                        styles.searchInput,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                            color: colors.text,
                        },
                    ]}
                />
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
        height: spacing.toolbarHeight,

        flexDirection: "row-reverse",
        alignItems: "center",

        paddingHorizontal: spacing.xl,

        borderRadius: radius.lg,

        ...shadows.sm,
    },

    sectionTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
    },

    /**
     * ============================================================================
     * Toolbar Sections
     * ============================================================================
     */

    search: {
        flex: 1,
    },

    searchInput: {
        height: 38,

        paddingHorizontal: spacing.lg,

        borderWidth: 1,
        borderRadius: radius.md,

        fontSize: typography.fontSize.md,
    },

    actions: {
        width: 220,

        flexDirection: "row",
        alignItems: "center",
        columnGap: spacing.md,
    },

    actionButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,

        borderRadius: radius.md,
    },

    actionButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    user: {
        width: 180,

        flexDirection: "row-reverse",
        alignItems: "center",
    },

    avatar: {
        width: 40,
        height: 40,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.pill,
    },

    avatarText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
    },

    userInfo: {
        flex: 1,

        marginRight: spacing.lg,
    },

    userName: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
    },

    userRole: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
    },
});
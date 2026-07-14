/**
 * ============================================================================
 * Sidebar
 * ----------------------------------------------------------------------------
 * Displays the application's navigation sidebar.
 * ============================================================================
 */

import {
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

import type { WorkspacePageType } from "../workspace";

import type { ProjectInfo } from "../project";

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface SidebarProps {
    activePage: WorkspacePageType;
    projectInfo: ProjectInfo | null;
    isProjectInfoLoading: boolean;
    projectInfoError: string | null;
    onChangePage: (page: WorkspacePageType) => void;
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function Sidebar({
    activePage,
    projectInfo,
    isProjectInfoLoading,
    projectInfoError,
    onChangePage,
}: SidebarProps) {
    const { theme } = useSettings();
    const colors = theme.colors;

    const { height } = useWindowDimensions();

    const isShortSidebar = height < 720;

    const projectSubtitle = isProjectInfoLoading
        ? "Loading project info..."
        : projectInfo
            ? `${projectInfo.projectName}${projectInfo.projectCode ? ` · ${projectInfo.projectCode}` : ""}`
            : projectInfoError ?? "Enterprise Document Management System";

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

            <View style={[
                styles.brand,
                isShortSidebar && styles.compactBrand,
            ]}>
                {/* Logo Placeholder */}

                <View
                    style={[
                        styles.logoPlaceholder,
                        isShortSidebar && styles.compactLogoPlaceholder,
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
                        isShortSidebar && styles.compactAppTitle,
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
                    {projectSubtitle}
                </Text>
            </View>

            {/* =========================================================================
            * Navigation
            * ========================================================================= */}

            <View style={styles.navigation}>
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

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="نمایش اسناد من"
                    onPress={() => onChangePage("workspace")}
                    style={[
                        styles.navigationButton,
                        activePage === "workspace" && {
                            backgroundColor: colors.background,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.navigationItem,
                            {
                                color:
                                    activePage === "workspace"
                                        ? colors.primary
                                        : colors.text,
                            },
                        ]}
                    >
                        My Documents
                    </Text>
                </Pressable>

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

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="نمایش آرشیو"
                    onPress={() => onChangePage("archive")}
                    style={[
                        styles.navigationButton,
                        activePage === "archive" && {
                            backgroundColor: colors.background,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.navigationItem,
                            {
                                color:
                                    activePage === "archive"
                                        ? colors.primary
                                        : colors.text,
                            },
                        ]}
                    >
                        Archive
                    </Text>
                </Pressable>

                {/* Trash */}

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="نمایش سطل زباله"
                    onPress={() => onChangePage("trash")}
                    style={[
                        styles.navigationButton,
                        activePage === "trash" && {
                            backgroundColor: colors.background,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.navigationItem,
                            {
                                color:
                                    activePage === "trash"
                                        ? colors.primary
                                        : colors.text,
                            },
                        ]}
                    >
                        Trash
                    </Text>
                </Pressable>
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
        padding: spacing.lg,

        borderRadius: radius.lg,

        ...shadows.md,
    },

    /**
     * ============================================================================
     * Brand
     * ============================================================================
     */

    brand: {
        paddingBottom: spacing.lg,
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

    navigationButton: {
        borderRadius: radius.md,
    },

    navigationItem: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,

        paddingVertical: spacing.sm,

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

    /**
     * ============================================================================
     * Compacts
     * ============================================================================
     */

    compactBrand: {
        paddingBottom: spacing.md,
    },

    compactLogoPlaceholder: {
        width: 56,
        height: 56,

        marginBottom: spacing.md,
    },

    compactAppTitle: {
        fontSize: typography.fontSize.xxl,
    },
});

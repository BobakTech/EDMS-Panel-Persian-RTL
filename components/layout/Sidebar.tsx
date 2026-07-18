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
 * Types
 * ============================================================================
 */

type AppPageType = "dashboard" | WorkspacePageType;

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface SidebarProps {
    activePage: AppPageType;
    projectInfo: ProjectInfo | null;
    isProjectInfoLoading: boolean;
    projectInfoError: string | null;
    onChangePage: (page: AppPageType) => void;
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
    const { theme, themeMode, toggleTheme } = useSettings();
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

            <View
                style={[
                    styles.brand,
                    isShortSidebar && styles.compactBrand,
                ]}
            >
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
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="نمایش داشبورد"
                    onPress={() => onChangePage("dashboard")}
                    style={[
                        styles.navigationButton,
                        activePage === "dashboard" && {
                            backgroundColor: colors.background,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.navigationItem,
                            {
                                color:
                                    activePage === "dashboard"
                                        ? colors.primary
                                        : colors.text,
                            },
                        ]}
                    >
                        Dashboard
                    </Text>
                </Pressable>

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

                <Text
                    style={[
                        styles.navigationItem,
                        styles.staticNavigationItem,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    Shared Documents
                </Text>

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
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="تغییر حالت روشن و تیره"
                    onPress={toggleTheme}
                    style={({ pressed }) => [
                        styles.utilityButton,
                        pressed && styles.pressedUtilityButton,
                    ]}
                >
                    <Text
                        style={[
                            styles.utilityItem,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {themeMode === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
                    </Text>
                </Pressable>

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

        justifyContent: "space-between",

        padding: spacing.lg,

        ...shadows.sm,
    },

    brand: {
        alignItems: "center",

        gap: spacing.md,
    },

    compactBrand: {
        gap: spacing.sm,
    },

    logoPlaceholder: {
        width: 78,
        height: 78,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.lg,
    },

    compactLogoPlaceholder: {
        width: 60,
        height: 60,
    },

    logoPlaceholderText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
    },

    appTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
    },

    compactAppTitle: {
        fontSize: typography.fontSize.lg,
    },

    appSubtitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "center",
    },

    navigation: {
        gap: spacing.sm,
    },

    navigationButton: {
        alignSelf: "stretch",

        minHeight: 34,

        justifyContent: "center",

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,

        borderRadius: radius.md,
    },

    navigationItem: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
    },

    staticNavigationItem: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },

    utilities: {
        gap: spacing.lg,
    },

    utilityButton: {
        alignSelf: "stretch",

        borderRadius: radius.md,
    },

    pressedUtilityButton: {
        opacity: 0.72,
    },

    utilityItem: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
    },
});

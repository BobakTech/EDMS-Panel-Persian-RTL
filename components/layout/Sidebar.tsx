/**
 * ============================================================================
 * Sidebar
 * ----------------------------------------------------------------------------
 * Displays the application's navigation sidebar.
 * ============================================================================
 */

import { Feather } from "@expo/vector-icons";

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

type AppPageType = "dashboard" | WorkspacePageType | "settings";

type FeatherIconName = keyof typeof Feather.glyphMap;

interface NavigationItemConfig {
    page: AppPageType;
    icon: FeatherIconName;
    label: string;
    accessibilityLabel: string;
}

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
 * Navigation
 * ============================================================================
 */

const navigationItems: NavigationItemConfig[] = [
    {
        page: "dashboard",
        icon: "grid",
        label: "داشبورد",
        accessibilityLabel: "نمایش داشبورد",
    },
    {
        page: "workspace",
        icon: "file-text",
        label: "اسناد من",
        accessibilityLabel: "نمایش اسناد من",
    },
    {
        page: "archive",
        icon: "archive",
        label: "آرشیو",
        accessibilityLabel: "نمایش آرشیو",
    },
    {
        page: "trash",
        icon: "trash-2",
        label: "سطل زباله",
        accessibilityLabel: "نمایش سطل زباله",
    },
];

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
        ? "در حال دریافت اطلاعات پروژه..."
        : projectInfo
            ? `${projectInfo.projectName}${projectInfo.projectCode ? ` · ${projectInfo.projectCode}` : ""}`
            : projectInfoError
                ? "اطلاعات پروژه در دسترس نیست."
                : "سامانه مدیریت اسناد سازمانی";

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
                            color: colors.text,
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
                {navigationItems.map((item) => {
                    const isSelected = activePage === item.page;

                    const itemColor = isSelected
                        ? colors.primary
                        : colors.text;

                    return (
                        <Pressable
                            key={item.page}
                            accessibilityRole="button"
                            accessibilityLabel={item.accessibilityLabel}
                            onPress={() => onChangePage(item.page)}
                            style={[
                                styles.navigationButton,
                                isSelected && {
                                    backgroundColor: colors.background,
                                },
                            ]}
                        >
                            <View style={styles.navigationButtonContent}>
                                <View style={styles.navigationIconBox}>
                                    <Feather
                                        name={item.icon}
                                        size={18}
                                        color={itemColor}
                                    />
                                </View>

                                <Text
                                    style={[
                                        styles.navigationItem,
                                        {
                                            color: itemColor,
                                        },
                                    ]}
                                >
                                    {item.label}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}

                <View style={styles.staticNavigationItem}>
                    <View style={styles.navigationIconBox}>
                        <Feather
                            name="users"
                            size={18}
                            color={colors.text}
                        />
                    </View>

                    <Text
                        style={[
                            styles.navigationItem,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        اسناد مشترک
                    </Text>
                </View>
            </View>

            {/* =========================================================================
            * Utilities
            * ========================================================================= */}

            {/* =========================================================================
 * Utilities
 * ========================================================================= */}

            <View style={styles.utilities}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="نمایش تنظیمات"
                    onPress={() => onChangePage("settings")}
                    style={({ pressed }) => [
                        styles.utilityButton,
                        activePage === "settings" && {
                            backgroundColor: colors.background,
                        },
                        pressed && styles.pressedUtilityButton,
                    ]}
                >
                    <View style={styles.utilityButtonContent}>
                        <View style={styles.navigationIconBox}>
                            <Feather
                                name="settings"
                                size={18}
                                color={
                                    activePage === "settings"
                                        ? colors.primary
                                        : colors.text
                                }
                            />
                        </View>

                        <Text
                            style={[
                                styles.utilityItem,
                                {
                                    color:
                                        activePage === "settings"
                                            ? colors.primary
                                            : colors.text,
                                },
                            ]}
                        >
                            تنظیمات
                        </Text>
                    </View>
                </Pressable>

                <View
                    style={[
                        styles.storageCard,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <View style={styles.storageHeader}>
                        <Text
                            style={[
                                styles.storageLabel,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            فضای ذخیره‌سازی
                        </Text>

                        <Text
                            style={[
                                styles.storageValue,
                                {
                                    color: colors.primary,
                                },
                            ]}
                        >
                            ۶۲٪
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.storageTrack,
                            {
                                backgroundColor: colors.surface,
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.storageProgress,
                                {
                                    width: "62%",
                                    backgroundColor: colors.primary,
                                },
                            ]}
                        />
                    </View>

                    <View style={styles.storageDetails}>
                        <Text
                            style={[
                                styles.storageDetailText,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            PDF · ۳۴٪
                        </Text>

                        <Text
                            style={[
                                styles.storageDetailText,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            DOCX / XLSX · ۱۵٪
                        </Text>

                        <Text
                            style={[
                                styles.storageDetailText,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            ZIP / RAR · ۷٪
                        </Text>

                        <Text
                            style={[
                                styles.storageDetailText,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            سایر فایل‌ها · ۶٪
                        </Text>
                    </View>
                </View>
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
        opacity: 0.72,

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

    navigationButtonContent: {
        flexDirection: "row-reverse",
        alignItems: "center",

        gap: spacing.sm,
    },

    navigationIconBox: {
        width: 24,

        alignItems: "center",
        justifyContent: "center",
    },

    navigationItem: {
        flex: 1,

        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    staticNavigationItem: {
        flexDirection: "row-reverse",
        alignItems: "center",

        gap: spacing.sm,

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },

    utilities: {
        gap: spacing.md,
    },

    storageCard: {
        gap: spacing.sm,

        padding: spacing.md,

        borderWidth: 1,
        borderRadius: radius.md,
    },

    storageHeader: {
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "space-between",

        gap: spacing.sm,
    },

    storageLabel: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    storageValue: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
    },

    storageTrack: {
        height: 8,

        overflow: "hidden",

        borderRadius: radius.pill,
    },

    storageProgress: {
        height: "100%",

        borderRadius: radius.pill,
    },

    storageDetails: {
        gap: spacing.xs,
    },

    storageDetailText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",
    },

    utilityButton: {
        alignSelf: "stretch",

        minHeight: 34,

        justifyContent: "center",

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,

        borderRadius: radius.md,
    },

    utilityButtonContent: {
        flexDirection: "row-reverse",
        alignItems: "center",

        gap: spacing.sm,
    },

    pressedUtilityButton: {
        opacity: 0.72,
    },

    utilityItem: {
        flex: 1,

        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },
});

/**
 * ============================================================================
 * Sidebar
 * ----------------------------------------------------------------------------
 * Displays desktop navigation and mobile drawer navigation.
 * ============================================================================
 */

import { Feather } from "../../web/icons";

import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "../../web/ui";

import panelLogo from "../../assets/panel-logo.png";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import type { TranslationKey } from "../../locales";

import type { ProjectInfo } from "../project";

/**
 * Import the new compact project-info panel.
 */
import { ProjectInfoPanel } from "../project/ProjectInfoPanel";

import type { WorkspacePageType } from "../workspace";

/**
 * ============================================================================
 * Types
 * ============================================================================
 */

type AppPageType = "dashboard" | WorkspacePageType | "settings";

type SidebarVariant = "desktop" | "drawer";

type FeatherIconName = keyof typeof Feather.glyphMap;

interface NavigationItemConfig {
    page: AppPageType;
    icon: FeatherIconName;
    labelKey: TranslationKey;
    accessibilityLabelKey: TranslationKey;
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

    /**
     * Project info error means the API smoke test failed.
     */
    projectInfoError?: string | null;

    onChangePage: (page: AppPageType) => void;
    variant?: SidebarVariant;
    showBrand?: boolean;
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
        labelKey: "dashboard",
        accessibilityLabelKey: "showDashboard",
    },
    {
        page: "workspace",
        icon: "file-text",
        labelKey: "myDocuments",
        accessibilityLabelKey: "showMyDocuments",
    },
    {
        page: "archive",
        icon: "archive",
        labelKey: "archive",
        accessibilityLabelKey: "showArchive",
    },
    {
        page: "trash",
        icon: "trash-2",
        labelKey: "trash",
        accessibilityLabelKey: "showTrash",
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
    projectInfoError = null,
    onChangePage,
    variant = "desktop",
    showBrand = true,
}: SidebarProps) {
    const { direction, t, theme } = useSettings();
    const colors = theme.colors;
    const isRtl = direction === "rtl";
    const textAlign = isRtl ? "right" : "left";

    const { height } = useWindowDimensions();

    const isShortSidebar = height < 720;

    const projectSubtitle = isProjectInfoLoading
        ? t("loadingProjectInfo")
        : projectInfo
            ? `${projectInfo.projectName}${projectInfo.projectCode ? ` · ${projectInfo.projectCode}` : ""}`
            : projectInfoError
                ? t("projectInfoUnavailable")
                : t("appName");

    return (
        <View
            style={[
                styles.container,
                variant === "drawer" && styles.drawerContainer,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    direction,
                },
            ]}
        >
            {showBrand && (
                <View
                    style={[
                        styles.brand,
                        isShortSidebar && styles.compactBrand,
                    ]}
                >
                    <Image
                        source={{ uri: panelLogo }}
                        resizeMode="contain"
                        style={[
                            styles.logoPlaceholder,
                            isShortSidebar && styles.compactLogoPlaceholder,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                        ]}
                    />

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

                    {/**
                    * Show project name/code as a compact sidebar list.
                    */}
                    <ProjectInfoPanel
                        projectInfo={projectInfo}
                        isLoading={isProjectInfoLoading}
                        error={projectInfoError}
                    />
                </View>
            )}

            <View
                style={[
                    styles.navigation,
                    { borderColor: colors.border },
                ]}
            >
                {navigationItems.map((item) => {
                    const isSelected = activePage === item.page;

                    const itemColor = isSelected
                        ? colors.primary
                        : colors.text;

                    return (
                        <Pressable
                            key={item.page}
                            accessibilityRole="button"
                            accessibilityLabel={t(item.accessibilityLabelKey)}
                            onPress={() => onChangePage(item.page)}
                            style={({ pressed }) => [
                                styles.navigationButton,
                                isSelected && {
                                    backgroundColor: colors.background,
                                    borderColor: colors.border,
                                },
                                pressed && styles.pressedNavigationButton,
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
                                            textAlign,
                                        },
                                    ]}
                                >
                                    {t(item.labelKey)}
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
                                textAlign,
                            },
                        ]}
                    >
                        {t("sharedDocuments")}
                    </Text>
                </View>
            </View>

            <View style={styles.utilities}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("showSettings")}
                    onPress={() => onChangePage("settings")}
                    style={({ pressed }) => [
                        styles.utilityButton,
                        activePage === "settings" && {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
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
                                    textAlign,
                                },
                            ]}
                        >
                            {t("settings")}
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
                            {t("storageSpace")}
                        </Text>

                        <Text
                            style={[
                                styles.storageValue,
                                {
                                    color: colors.primary,
                                    textAlign: isRtl ? "left" : "right",
                                },
                            ]}
                        >
                            {isRtl ? "۶۲٪" : "62%"}
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
                                    textAlign,
                                },
                            ]}
                        >
                            {isRtl ? "PDF · ۳۴٪" : "PDF · 34%"}
                        </Text>

                        <Text
                            style={[
                                styles.storageDetailText,
                                {
                                    color: colors.text,
                                    textAlign,
                                },
                            ]}
                        >
                            {isRtl ? "DOCX / XLSX · ۱۵٪" : "DOCX / XLSX · 15%"}
                        </Text>

                        <Text
                            style={[
                                styles.storageDetailText,
                                {
                                    color: colors.text,
                                    textAlign,
                                },
                            ]}
                        >
                            {isRtl ? "ZIP / RAR · ۷٪" : "ZIP / RAR · 7%"}
                        </Text>

                        <Text
                            style={[
                                styles.storageDetailText,
                                {
                                    color: colors.text,
                                    textAlign,
                                },
                            ]}
                        >
                            {t("otherFiles")} · {isRtl ? "۶٪" : "6%"}
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

        borderLeftWidth: 1,

        ...shadows.sm,
    },

    drawerContainer: {
        width: "100%",
        flex: 1,

        justifyContent: "flex-start",

        paddingHorizontal: 0,
        paddingVertical: 0,

        gap: spacing.lg,

        boxShadow: "none",
    },

    brand: {
        alignItems: "center",

        gap: spacing.md,
    },

    compactBrand: {
        gap: spacing.sm,
    },

    /**
     * Keeps the project identity and connection signal visually grouped.
     */
    brandContent: {
        flex: 1,
        minWidth: 0,

        gap: spacing.sm,
    },

    logoPlaceholder: {
        width: 184,
        height: 72,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.lg,
    },

    compactLogoPlaceholder: {
        width: 140,
        height: 55,
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

        paddingVertical: spacing.md,

        borderTopWidth: 1,
        borderBottomWidth: 1,
    },

    navigationButton: {
        alignSelf: "stretch",

        minHeight: 34,

        justifyContent: "center",

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,

        borderWidth: 1,
        borderColor: "transparent",
        borderRadius: radius.md,
    },

    pressedNavigationButton: {
        opacity: 0.82,
    },

    navigationButtonContent: {
        flexDirection: "row",
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
        flexDirection: "row",
        alignItems: "center",

        gap: spacing.sm,

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },

    utilities: {
        gap: spacing.md,
    },

    utilityButton: {
        alignSelf: "stretch",

        minHeight: 34,

        justifyContent: "center",

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,

        borderWidth: 1,
        borderColor: "transparent",
        borderRadius: radius.md,
    },

    utilityButtonContent: {
        flexDirection: "row",
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

    storageCard: {
        gap: spacing.sm,

        padding: spacing.md,

        borderWidth: 1,
        borderRadius: radius.md,
    },

    storageHeader: {
        flexDirection: "row",
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
});

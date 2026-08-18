/**
 * ============================================================================
 * Sidebar
 * ----------------------------------------------------------------------------
 * Displays desktop navigation and mobile drawer navigation.
 * ============================================================================
 */

import { useState } from "react";

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
import panelFavicon from "../../assets/panel-favicon.png";

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
    order: number;
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
        order: 0,
        labelKey: "dashboard",
        accessibilityLabelKey: "showDashboard",
    },
    {
        page: "workspace",
        icon: "file-text",
        order: 1,
        labelKey: "myDocuments",
        accessibilityLabelKey: "showMyDocuments",
    },
    {
        page: "archive",
        icon: "archive",
        order: 3,
        labelKey: "archive",
        accessibilityLabelKey: "showArchive",
    },
    {
        page: "trash",
        icon: "trash-2",
        order: 4,
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
    const [isPinnedOpen, setIsPinnedOpen] = useState(false);
    const isExpanded = variant === "drawer" || isPinnedOpen;
    const desktopSidebarWidth = isExpanded ? spacing.sidebarWidth : 72;
    const sidebarToggleIcon = isRtl
        ? isPinnedOpen ? "panel-right-close" : "panel-right-open"
        : isPinnedOpen ? "panel-left-close" : "panel-left-open";
    const connectionLabel = isProjectInfoLoading
        ? t("projectConnectionConnecting")
        : projectInfoError
            ? t("projectConnectionFailed")
            : t("projectConnectionConnected");
    const connectionTooltip = isProjectInfoLoading
        ? t("connectionConnectingShort")
        : projectInfoError
            ? t("connectionUnavailableShort")
            : t("connectionConnectedShort");
    const connectionColor = isProjectInfoLoading
        ? "#F59E0B"
        : projectInfoError
            ? "#EF4444"
            : "#22C55E";
    const connectionIcon = isProjectInfoLoading
        ? "cloud-cog"
        : projectInfoError
            ? "cloud-off"
            : "cloud";

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
                variant === "desktop" && styles.desktopWrapper,
                variant === "drawer" && styles.drawerWrapper,
                {
                    direction,
                },
            ]}
        >
            {variant === "desktop" && (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t(isPinnedOpen ? "unpinSidebar" : "pinSidebar")}
                    accessibilityState={{ selected: isPinnedOpen }}
                    title={t(isPinnedOpen ? "unpinSidebar" : "pinSidebar")}
                    onPress={() => setIsPinnedOpen((current) => !current)}
                    style={[
                        styles.sidebarPinButton,
                        isRtl
                            ? { left: -18 }
                            : { right: -18 },
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Feather
                        name={sidebarToggleIcon}
                        size={18}
                        color={colors.primary}
                    />
                </Pressable>
            )}

            <View
                style={[
                    styles.container,
                    variant === "desktop" && styles.desktopContainer,
                    variant === "drawer" && styles.drawerContainer,
                    !isExpanded && styles.collapsedContainer,
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
                        <View
                            style={[
                                styles.brandHeader,
                                !isExpanded && styles.collapsedBrandHeader,
                            ]}
                        >
                            {isExpanded && <Image
                                source={{ uri: panelLogo }}
                                resizeMode="contain"
                                style={[
                                    styles.logoPlaceholder,
                                    isShortSidebar && styles.compactLogoPlaceholder,
                                    {
                                        backgroundColor: "transparent",
                                        borderColor: colors.border,
                                    },
                                ]}
                            />}

                            {!isExpanded && <Image
                                source={{ uri: panelFavicon }}
                                resizeMode="contain"
                                accessibilityLabel={t("appName")}
                                style={styles.collapsedLogo}
                            />}

                        </View>

                        {isExpanded && <Text
                            style={[
                                styles.appTitle,
                                isShortSidebar && styles.compactAppTitle,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            {t("appName")}
                        </Text>}

                        <View
                            style={[
                                styles.sectionSeparator,
                                { backgroundColor: colors.border },
                            ]}
                        />

                        {!isExpanded && (
                            <View
                                accessibilityRole="status"
                                accessibilityLabel={connectionLabel}
                                title={connectionTooltip}
                                style={styles.collapsedConnectionStatus}
                            >
                                <Feather
                                    name={connectionIcon}
                                    size={20}
                                    color={connectionColor}
                                />
                            </View>
                        )}

                        {/**
                    * Show project name/code as a compact sidebar list.
                    */}
                        {isExpanded && <ProjectInfoPanel
                            projectInfo={projectInfo}
                            isLoading={isProjectInfoLoading}
                            error={projectInfoError}
                        />}
                    </View>
                )}

                {showBrand && (
                    <View
                        style={[
                            styles.sectionSeparator,
                            { backgroundColor: colors.border },
                        ]}
                    />
                )}

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
                                accessibilityLabel={t(item.accessibilityLabelKey)}
                                title={!isExpanded ? t(item.labelKey) : undefined}
                                onPress={() => onChangePage(item.page)}
                                style={({ pressed }) => [
                                    styles.navigationButton,
                                    { order: item.order },
                                    !isExpanded && styles.collapsedNavigationButton,
                                    isSelected && {
                                        backgroundColor: colors.background,
                                        borderColor: colors.border,
                                    },
                                    pressed && styles.pressedNavigationButton,
                                ]}
                            >
                                <View
                                    style={[
                                        styles.navigationButtonContent,
                                        !isExpanded && styles.collapsedButtonContent,
                                    ]}
                                >
                                    <View style={styles.navigationIconBox}>
                                        <Feather
                                            name={item.icon}
                                            size={18}
                                            color={itemColor}
                                        />
                                    </View>

                                    {isExpanded && <Text
                                        style={[
                                            styles.navigationItem,
                                            {
                                                color: itemColor,
                                                textAlign,
                                            },
                                        ]}
                                    >
                                        {t(item.labelKey)}
                                    </Text>}
                                </View>
                            </Pressable>
                        );
                    })}

                    <View
                        title={!isExpanded ? t("sharedDocuments") : undefined}
                        style={[
                            styles.staticNavigationItem,
                            !isExpanded && styles.collapsedStaticNavigationItem,
                            { order: 2 },
                        ]}
                    >
                        <View style={styles.navigationIconBox}>
                            <Feather
                                name="users"
                                size={18}
                                color={colors.text}
                            />
                        </View>

                        {isExpanded && <Text
                            style={[
                                styles.navigationItem,
                                {
                                    color: colors.text,
                                    textAlign,
                                },
                            ]}
                        >
                            {t("sharedDocuments")}
                        </Text>}
                    </View>
                </View>

                <View style={styles.utilities}>
                    <View
                        style={[
                            styles.sectionSeparator,
                            { backgroundColor: colors.border },
                        ]}
                    />

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("showSettings")}
                        title={!isExpanded ? t("settings") : undefined}
                        onPress={() => onChangePage("settings")}
                        style={({ pressed }) => [
                            styles.utilityButton,
                            !isExpanded && styles.collapsedNavigationButton,
                            activePage === "settings" && {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                            pressed && styles.pressedUtilityButton,
                        ]}
                    >
                        <View
                            style={[
                                styles.utilityButtonContent,
                                !isExpanded && styles.collapsedButtonContent,
                            ]}
                        >
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

                            {isExpanded && <Text
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
                            </Text>}
                        </View>
                    </Pressable>

                    {isExpanded && <View
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
                    </View>}
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

        justifyContent: "flex-start",

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,

        gap: spacing.md,

        borderLeftWidth: 1,

        ...shadows.sm,

        transition: "width 160ms ease, padding 160ms ease",
    },

    collapsedContainer: {
        width: 72,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.md,
    },

    desktopContainer: {
        height: "100%",
        overflowX: "hidden",
        overflowY: "auto",
    },

    desktopWrapper: {
        position: "sticky",
        top: 0,
        height: "100vh",
        alignSelf: "flex-start",
        zIndex: 50,
    },

    drawerWrapper: {
        width: "100%",
        flex: 1,
    },

    sidebarPinButton: {
        width: 36,
        height: 36,

        position: "absolute",
        top: 42,
        zIndex: 60,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.pill,
        cursor: "pointer",

        ...shadows.md,
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
        alignItems: "stretch",

        gap: spacing.sm,
    },

    brandHeader: {
        minHeight: 72,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        gap: spacing.sm,
    },

    collapsedBrandHeader: {
        minHeight: 32,
        justifyContent: "center",
    },

    collapsedLogo: {
        width: 32,
        height: 32,
    },

    collapsedConnectionStatus: {
        minHeight: 32,
        alignSelf: "center",

        alignItems: "center",
        justifyContent: "center",
    },

    sectionSeparator: {
        width: "100%",
        height: 1,
        flexShrink: 0,
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
        width: "100%",

        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        textAlign: "center",
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
        gap: spacing.xs,

        paddingVertical: spacing.sm,
    },

    navigationButton: {
        alignSelf: "stretch",

        minHeight: 38,

        justifyContent: "center",

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,

        borderWidth: 1,
        borderColor: "transparent",
        borderRadius: radius.md,
    },

    collapsedNavigationButton: {
        paddingHorizontal: 0,
    },

    collapsedButtonContent: {
        width: "100%",
        justifyContent: "center",
        gap: 0,
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
        minHeight: 38,

        flexDirection: "row",
        alignItems: "center",

        gap: spacing.sm,

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },

    collapsedStaticNavigationItem: {
        paddingHorizontal: 0,
        justifyContent: "center",
        gap: 0,
    },

    utilities: {
        marginTop: "auto",

        gap: spacing.md,
    },

    utilityButton: {
        alignSelf: "stretch",

        minHeight: 38,

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

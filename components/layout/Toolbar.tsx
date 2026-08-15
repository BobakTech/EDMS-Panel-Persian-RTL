/**
 * ============================================================================
 * Toolbar
 * ----------------------------------------------------------------------------
 * Displays desktop toolbar, mobile header, and mobile drawer actions.
 * ============================================================================
 */

import { Feather } from "../../web/icons";
import * as DocumentPicker from "../../web/document-picker";

import { useEffect, useRef, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "../../web/ui";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

import type { ProjectInfo } from "../project";

import type {
    WorkspaceActionType,
    WorkspacePickedFile,
} from "../workspace";

/**
 * ============================================================================
 * Types
 * ============================================================================
 */

type ToolbarVariant = "desktop" | "mobile-header" | "mobile-menu";

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface ToolbarProps {
    activeAction: WorkspaceActionType | null;
    searchQuery: string;
    onChangeSearchQuery: (query: string) => void;
    onPressCreateFolder: () => void;
    onDismissAction: () => void;
    onCreateFolder: (folderName: string) => void;
    onCreateFile: (file: WorkspacePickedFile) => void;
    canCreateWorkspaceItems: boolean;
    variant?: ToolbarVariant;
    projectInfo?: ProjectInfo | null;
    isProjectInfoLoading?: boolean;
    projectInfoError?: string | null;
    isMobileMenuOpen?: boolean;
    onPressMobileMenu?: () => void;
}

/**
 * ============================================================================
 * Helpers
 * ============================================================================
 */

function wait(milliseconds: number) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function Toolbar({
    activeAction,
    searchQuery,
    onChangeSearchQuery,
    onPressCreateFolder,
    onDismissAction,
    onCreateFolder,
    onCreateFile,
    canCreateWorkspaceItems,
    variant = "desktop",
    projectInfo,
    isProjectInfoLoading = false,
    projectInfoError = null,
    isMobileMenuOpen = false,
    onPressMobileMenu,
}: ToolbarProps) {
    const { theme } = useSettings();
    const colors = theme.colors;

    const newFolderInputRef = useRef<TextInput>(null);

    const [newFolderName, setNewFolderName] = useState("");

    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadFileName, setUploadFileName] = useState<string | null>(null);
    const [uploadStatusText, setUploadStatusText] = useState("");

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const isPreparingUpload = uploadProgress !== null;

    const isMobileHeader = variant === "mobile-header";
    const isMobileMenu = variant === "mobile-menu";

    const projectSubtitle = isProjectInfoLoading
        ? "در حال دریافت اطلاعات پروژه..."
        : projectInfo
            ? `${projectInfo.projectName}${projectInfo.projectCode ? ` · ${projectInfo.projectCode}` : ""}`
            : projectInfoError
                ? "اطلاعات پروژه در دسترس نیست."
                : "سامانه مدیریت اسناد سازمانی";

    /**
     * ============================================================================
     * New Folder Autofocus
     * ============================================================================
     */

    useEffect(() => {
        if (activeAction !== "new-folder") {
            return;
        }

        const focusTimer = setTimeout(() => {
            newFolderInputRef.current?.focus();
        }, 50);

        return () => {
            clearTimeout(focusTimer);
        };
    }, [activeAction]);

    function handleCreateFolder() {
        onCreateFolder(newFolderName);
        setNewFolderName("");
    }

    function resetUploadProgress() {
        setUploadProgress(null);
        setUploadFileName(null);
        setUploadStatusText("");
    }

    async function handlePickFile() {
        if (isPreparingUpload) {
            return;
        }

        onDismissAction();

        const result = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory: true,
            multiple: false,
        });

        if (result.canceled || !result.assets[0]) {
            return;
        }

        const selectedFile = result.assets[0];

        setUploadFileName(selectedFile.name);
        setUploadStatusText("در حال آماده‌سازی فایل...");
        setUploadProgress(15);

        await wait(250);

        setUploadStatusText("در حال خواندن اطلاعات فایل...");
        setUploadProgress(55);

        await wait(250);

        setUploadStatusText("در حال افزودن به فضای کاری...");
        setUploadProgress(90);

        await wait(200);

        onCreateFile({
            name: selectedFile.name,
            size: selectedFile.size,
            mimeType: selectedFile.mimeType,
            uri: selectedFile.uri,
        });

        setUploadProgress(100);

        await wait(200);

        resetUploadProgress();
    }

    /**
     * Opens the native file picker when upload is triggered from the mobile drawer.
     */

    useEffect(() => {
        if (activeAction !== "upload") {
            return;
        }

        void handlePickFile();
    }, [activeAction]);

    const newFolderModal = (
        <Modal
            transparent
            visible={activeAction === "new-folder"}
            animationType="fade"
            onRequestClose={onDismissAction}
        >
            <View style={styles.popupOverlay}>
                <View
                    style={[
                        styles.actionPanel,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.primary,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.actionPanelTitle,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        ساخت پوشه جدید
                    </Text>

                    <TextInput
                        ref={newFolderInputRef}
                        placeholder="نام پوشه"
                        placeholderTextColor={colors.border}
                        value={newFolderName}
                        onChangeText={setNewFolderName}
                        style={[
                            styles.actionPanelInput,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                                color: colors.text,
                            },
                        ]}
                    />

                    <View style={styles.actionPanelButtons}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="ایجاد پوشه"
                            onPress={handleCreateFolder}
                            style={[
                                styles.actionPanelPrimaryButton,
                                {
                                    backgroundColor: colors.primary,
                                },
                            ]}
                        >
                            <Feather
                                name="check"
                                size={16}
                                color={colors.surface}
                            />
                            <Text
                                style={[
                                    styles.actionPanelPrimaryButtonText,
                                    {
                                        color: colors.surface,
                                    },
                                ]}
                            >
                                ایجاد
                            </Text>
                        </Pressable>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="بستن فرم"
                            onPress={onDismissAction}
                            style={[
                                styles.actionPanelSecondaryButton,
                                {
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <Feather
                                name="x"
                                size={16}
                                color={colors.text}
                            />
                            <Text
                                style={[
                                    styles.actionPanelSecondaryButtonText,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                            >
                                لغو
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );

    /**
     * ============================================================================
     * Desktop Upload Panel
     * ----------------------------------------------------------------------------
     * Renders upload progress in a transparent modal so it is not clipped by the
     * toolbar or workspace layout.
     * ============================================================================
     */

    const desktopUploadPanel = (
        <Modal
            transparent
            visible={!isMobileHeader && isPreparingUpload}
            animationType="fade"
        >
            <View style={styles.uploadOverlay}>
                <View
                    style={[
                        styles.uploadPanel,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.primary,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.uploadPanelTitle,
                            {
                                color: colors.text,
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {uploadFileName ?? "فایل انتخاب‌شده"}
                    </Text>

                    <Text
                        style={[
                            styles.uploadPanelDescription,
                            {
                                color: colors.border,
                            },
                        ]}
                    >
                        {uploadStatusText}
                    </Text>

                    <View
                        style={[
                            styles.uploadProgressTrack,
                            {
                                backgroundColor: colors.background,
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.uploadProgressFill,
                                {
                                    width: `${uploadProgress ?? 0}%`,
                                    backgroundColor: colors.primary,
                                },
                            ]}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );

    const mobileUploadPanel = isPreparingUpload ? (
        <View
            style={[
                styles.mobileUploadPanel,
                {
                    backgroundColor: colors.background,
                    borderColor: colors.primary,
                },
            ]}
        >
            <Text
                style={[
                    styles.uploadPanelTitle,
                    {
                        color: colors.text,
                    },
                ]}
                numberOfLines={1}
            >
                {uploadFileName ?? "فایل انتخاب‌شده"}
            </Text>

            <Text
                style={[
                    styles.uploadPanelDescription,
                    {
                        color: colors.border,
                    },
                ]}
            >
                {uploadStatusText}
            </Text>

            <View
                style={[
                    styles.uploadProgressTrack,
                    {
                        backgroundColor: colors.surface,
                    },
                ]}
            >
                <View
                    style={[
                        styles.uploadProgressFill,
                        {
                            width: `${uploadProgress ?? 0}%`,
                            backgroundColor: colors.primary,
                        },
                    ]}
                />
            </View>
        </View>
    ) : null;

    if (isMobileHeader) {
        return (
            <View
                style={[
                    styles.container,
                    styles.mobileHeaderContainer,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                        isMobileMenuOpen ? "بستن منوی موبایل" : "باز کردن منوی موبایل"
                    }
                    onPress={onPressMobileMenu}
                    style={({ pressed }) => [
                        styles.mobileMenuButton,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                        },
                        pressed && styles.pressedActionButton,
                    ]}
                >
                    <Feather
                        name={isMobileMenuOpen ? "x" : "menu"}
                        size={20}
                        color={colors.text}
                    />
                </Pressable>

                <View style={styles.mobileBrand}>
                    <View
                        style={[
                            styles.mobileLogo,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.mobileLogoText,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            Logo
                        </Text>
                    </View>

                    <View style={styles.mobileBrandText}>
                        <Text
                            style={[
                                styles.mobileAppTitle,
                                {
                                    color: colors.text,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            EDMS
                        </Text>

                        <Text
                            style={[
                                styles.mobileProjectSubtitle,
                                {
                                    color: colors.text,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {projectSubtitle}
                        </Text>
                    </View>
                </View>

                <View style={styles.mobileUserArea}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                            isUserMenuOpen
                                ? "بستن منوی حساب کاربری"
                                : "باز کردن منوی حساب کاربری"
                        }
                        onPress={() => setIsUserMenuOpen((currentValue) => !currentValue)}
                        style={({ pressed }) => [
                            styles.avatar,
                            styles.mobileAvatar,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                            pressed && styles.pressedActionButton,
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
                    </Pressable>

                    <Modal
                        transparent
                        visible={isUserMenuOpen}
                        animationType="fade"
                        onRequestClose={() => setIsUserMenuOpen(false)}
                    >
                        <View style={styles.mobileUserMenuModal}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="بستن منوی حساب کاربری"
                                onPress={() => setIsUserMenuOpen(false)}
                                style={styles.mobileUserMenuBackdrop}
                            />

                            <View
                                style={[
                                    styles.mobileUserMenu,
                                    {
                                        backgroundColor: colors.background,
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                <View style={styles.mobileUserMenuHeader}>
                                    <Text
                                        style={[
                                            styles.mobileUserMenuName,
                                            {
                                                color: colors.text,
                                            },
                                        ]}
                                    >
                                        Bobak T.
                                    </Text>

                                    <Text
                                        style={[
                                            styles.mobileUserMenuRole,
                                            {
                                                color: colors.text,
                                            },
                                        ]}
                                    >
                                        توسعه‌دهنده نرم‌افزار
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        styles.mobileUserMenuDivider,
                                        {
                                            backgroundColor: colors.border,
                                        },
                                    ]}
                                />

                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="نمایش پروفایل کاربر"
                                    onPress={() => setIsUserMenuOpen(false)}
                                    style={({ pressed }) => [
                                        styles.mobileUserMenuItem,
                                        pressed && styles.pressedActionButton,
                                    ]}
                                >
                                    <Feather
                                        name="user"
                                        size={16}
                                        color={colors.text}
                                    />

                                    <Text
                                        style={[
                                            styles.mobileUserMenuItemText,
                                            {
                                                color: colors.text,
                                            },
                                        ]}
                                    >
                                        پروفایل کاربر
                                    </Text>
                                </Pressable>

                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="خروج از حساب کاربری"
                                    onPress={() => setIsUserMenuOpen(false)}
                                    style={({ pressed }) => [
                                        styles.mobileUserMenuItem,
                                        pressed && styles.pressedActionButton,
                                    ]}
                                >
                                    <Feather
                                        name="log-out"
                                        size={16}
                                        color={colors.text}
                                    />

                                    <Text
                                        style={[
                                            styles.mobileUserMenuItemText,
                                            {
                                                color: colors.text,
                                            },
                                        ]}
                                    >
                                        خروج از حساب
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>
        );
    }

    if (isMobileMenu) {
        return (
            <View
                style={[
                    styles.container,
                    styles.mobileMenuContainer,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <TextInput
                    value={searchQuery}
                    onChangeText={onChangeSearchQuery}
                    placeholder="جست‌وجو..."
                    placeholderTextColor={colors.border}
                    style={[
                        styles.searchInput,
                        styles.mobileSearchInput,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                            color: colors.text,
                        },
                    ]}
                />

                {canCreateWorkspaceItems && (
                    <View style={styles.mobileMenuActionsArea}>
                        <View style={styles.mobileMenuActions}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="بارگذاری فایل"
                                onPress={handlePickFile}
                                disabled={isPreparingUpload}
                                style={({ pressed }) => [
                                    styles.actionSegmentButton,
                                    styles.mobileMenuActionButton,
                                    isPreparingUpload && styles.disabledActionButton,
                                    pressed &&
                                    !isPreparingUpload &&
                                    styles.pressedActionButton,
                                    {
                                        backgroundColor: colors.primary,
                                        borderColor: colors.primary,
                                    },
                                ]}
                            >
                                <Feather
                                    name="upload"
                                    size={16}
                                    color={colors.surface}
                                />
                                <Text
                                    style={[
                                        styles.actionSegmentPrimaryText,
                                        {
                                            color: colors.surface,
                                        },
                                    ]}
                                >
                                    بارگذاری
                                </Text>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="ساخت پوشه جدید"
                                onPress={onPressCreateFolder}
                                style={({ pressed }) => [
                                    styles.actionSegmentButton,
                                    styles.mobileMenuActionButton,
                                    {
                                        backgroundColor: colors.background,
                                        borderColor: colors.border,
                                    },
                                    pressed && styles.pressedActionButton,
                                ]}
                            >
                                <Feather
                                    name="folder-plus"
                                    size={16}
                                    color={colors.text}
                                />
                                <Text
                                    style={[
                                        styles.actionSegmentSecondaryText,
                                        {
                                            color: colors.text,
                                        },
                                    ]}
                                >
                                    پوشه جدید
                                </Text>
                            </Pressable>
                        </View>

                        {mobileUploadPanel}
                        {newFolderModal}
                    </View>
                )}
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                },
            ]}
        >
            <View style={styles.user}>
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
                                color: colors.text,
                            },
                        ]}
                    >
                        توسعه‌دهنده نرم‌افزار
                    </Text>
                </View>
            </View>

            {canCreateWorkspaceItems && (
                <View style={styles.actionsArea}>
                    <View
                        style={[
                            styles.actions,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="بارگذاری فایل"
                            onPress={handlePickFile}
                            disabled={isPreparingUpload}
                            style={({ pressed }) => [
                                styles.actionSegmentButton,
                                styles.primaryActionSegmentButton,
                                isPreparingUpload && styles.disabledActionButton,
                                pressed && !isPreparingUpload && styles.pressedActionButton,
                                {
                                    backgroundColor: colors.primary,
                                },
                            ]}
                        >
                            <Feather
                                name="upload"
                                size={16}
                                color={colors.surface}
                            />
                            <Text
                                style={[
                                    styles.actionSegmentPrimaryText,
                                    {
                                        color: colors.surface,
                                    },
                                ]}
                            >
                                بارگذاری
                            </Text>
                        </Pressable>

                        <View
                            style={[
                                styles.actionSegmentDivider,
                                {
                                    backgroundColor: colors.border,
                                },
                            ]}
                        />

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="ساخت پوشه جدید"
                            onPress={onPressCreateFolder}
                            style={({ pressed }) => [
                                styles.actionSegmentButton,
                                pressed && styles.pressedActionButton,
                            ]}
                        >
                            <Feather
                                name="folder-plus"
                                size={16}
                                color={colors.text}
                            />
                            <Text
                                style={[
                                    styles.actionSegmentSecondaryText,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                            >
                                پوشه جدید
                            </Text>
                        </Pressable>
                    </View>

                    {newFolderModal}
                    {desktopUploadPanel}
                </View>
            )}

            <TextInput
                value={searchQuery}
                onChangeText={onChangeSearchQuery}
                placeholder="جست‌وجو..."
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
    );
}

/**
 * ============================================================================
 * Styles
 * ============================================================================
 */

const styles = StyleSheet.create({
    container: {
        width: "100%",
        minWidth: 0,
        minHeight: 72,

        flexDirection: "row",
        alignItems: "flex-start",

        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,

        borderRadius: radius.lg,
        borderWidth: 1,

        gap: spacing.md,

        ...shadows.sm,
    },

    user: {
        flexDirection: "row",
        alignItems: "center",

        gap: spacing.sm,
    },

    avatar: {
        width: 42,
        height: 42,

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
        minWidth: 150,

        alignItems: "flex-start",
    },

    userName: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
    },

    userRole: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,

        opacity: 0.56,
    },

    actionsArea: {
        position: "relative",

        alignItems: "flex-end",
    },

    actions: {
        flexDirection: "row",
        alignItems: "center",

        borderWidth: 1,
        borderRadius: radius.lg,

        overflow: "hidden",
    },

    actionSegmentButton: {
        minHeight: 42,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: spacing.lg,

        gap: spacing.sm,
    },

    primaryActionSegmentButton: {
        minWidth: 104,
    },

    pressedActionButton: {
        opacity: 0.82,
    },

    disabledActionButton: {
        opacity: 0.72,
    },

    actionSegmentPrimaryText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    actionSegmentSecondaryText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    actionSegmentDivider: {
        width: 1,
        alignSelf: "stretch",

        opacity: 0.72,
    },

    popupOverlay: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,

        width: "100vw",
        height: "100vh",

        alignItems: "center",
        justifyContent: "center",

        padding: spacing.xl,

        backgroundColor: "rgba(0, 0, 0, 0.32)",
    },

    actionPanel: {
        width: "100%",
        maxWidth: 320,
        maxHeight: "calc(100vh - 48px)",

        padding: spacing.lg,

        direction: "rtl",

        borderWidth: 1,
        borderRadius: radius.lg,

        ...shadows.md,
    },

    actionPanelTitle: {
        marginBottom: spacing.sm,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    actionPanelInput: {
        minHeight: 40,

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.md,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        textAlign: "right",
    },

    actionPanelButtons: {
        flexDirection: "row",
        alignItems: "center",

        marginTop: spacing.md,

        gap: spacing.sm,
    },

    actionPanelPrimaryButton: {
        minHeight: 36,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: spacing.md,

        gap: spacing.xs,

        borderRadius: radius.md,
    },

    actionPanelPrimaryButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    actionPanelSecondaryButton: {
        minHeight: 36,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: spacing.md,

        gap: spacing.xs,

        borderWidth: 1,
        borderRadius: radius.md,
    },

    actionPanelSecondaryButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    uploadPanel: {
        width: 360,
        maxWidth: "86%",

        padding: spacing.md,

        borderWidth: 1,
        borderRadius: radius.lg,

        ...shadows.md,
    },

    uploadPanelTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    /**
     * ============================================================================
     * Upload Overlay
     * ----------------------------------------------------------------------------
     * Positions desktop upload progress above the full app layout.
     * ============================================================================
     */

    uploadOverlay: {
        flex: 1,
        alignItems: "center",
        paddingTop: 92,
        pointerEvents: "box-none",
    },

    uploadPanelDescription: {
        marginTop: spacing.xs,

        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        textAlign: "right",
    },

    uploadProgressTrack: {
        height: 6,

        marginTop: spacing.sm,

        borderRadius: radius.pill,

        overflow: "hidden",
    },

    uploadProgressFill: {
        height: "100%",

        borderRadius: radius.pill,
    },

    searchInput: {
        flex: 1,
        minHeight: 40,

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.md,

        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",
    },

    mobileHeaderContainer: {
        minHeight: 60,

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,

        gap: spacing.sm,
    },

    mobileMenuContainer: {
        width: "100%",
        minHeight: 0,

        flexDirection: "column",
        alignItems: "stretch",

        borderWidth: 0,
        borderRadius: 0,

        paddingHorizontal: 0,
        paddingVertical: 0,

        gap: spacing.md,

        boxShadow: "none",
    },

    mobileMenuButton: {
        width: 38,
        height: 38,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.md,
    },

    mobileBrand: {
        flex: 1,
        minWidth: 0,

        flexDirection: "row",
        alignItems: "center",

        gap: spacing.sm,
    },

    mobileLogo: {
        width: 38,
        height: 38,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.md,
    },

    mobileLogoText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
    },

    mobileBrandText: {
        flex: 1,
        minWidth: 0,

        alignItems: "flex-end",
    },

    mobileAppTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        textAlign: "right",
    },

    mobileProjectSubtitle: {
        marginTop: spacing.xs,

        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",

        opacity: 0.64,
    },

    mobileAvatar: {
        width: 36,
        height: 36,
    },

    mobileUserArea: {
        position: "relative",
    },

    /**
     * Mobile account menu is modal-based so it appears above page content.
     */

    mobileUserMenuModal: {
        flex: 1,
    },

    mobileUserMenuBackdrop: {
        ...StyleSheet.absoluteFill,

        backgroundColor: "transparent",
    },

    mobileUserMenu: {
        position: "absolute",
        top: 72,
        left: spacing.sm,
        zIndex: 1,

        minWidth: 210,

        padding: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.md,

        ...shadows.md,
    },

    mobileUserMenuHeader: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },

    mobileUserMenuName: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        textAlign: "right",
    },

    mobileUserMenuRole: {
        marginTop: spacing.xs,

        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",

        opacity: 0.64,
    },

    mobileUserMenuDivider: {
        height: 1,

        marginVertical: spacing.sm,

        opacity: 0.64,
    },

    mobileUserMenuItem: {
        minHeight: 36,

        flexDirection: "row",
        alignItems: "center",

        gap: spacing.sm,

        paddingHorizontal: spacing.sm,

        borderRadius: radius.sm,
    },

    mobileUserMenuItemText: {
        flex: 1,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    mobileSearchInput: {
        width: "100%",
        flex: 0,
    },

    mobileMenuActionsArea: {
        gap: spacing.sm,
    },

    mobileMenuActions: {
        width: "100%",

        gap: spacing.sm,
    },

    mobileMenuActionButton: {
        width: "100%",

        borderWidth: 1,
        borderRadius: radius.md,
    },

    mobileUploadPanel: {
        width: "100%",

        padding: spacing.md,

        borderWidth: 1,
        borderRadius: radius.lg,
    },
});

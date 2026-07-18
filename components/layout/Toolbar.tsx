/**
 * ============================================================================
 * Toolbar
 * ----------------------------------------------------------------------------
 * Displays the application's top toolbar.
 * ============================================================================
 */

import * as DocumentPicker from "expo-document-picker";

import { useEffect, useRef, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import type {
    WorkspaceActionType,
    WorkspacePickedFile,
} from "../workspace";

import { radius, shadows, spacing, typography } from "../../theme";

import { useSettings } from "../../settings/SettingsContext";

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
}: ToolbarProps) {
    const { theme, themeMode, toggleTheme } = useSettings();
    const colors = theme.colors;

    const newFolderInputRef = useRef<TextInput>(null);

    const [newFolderName, setNewFolderName] = useState("");

    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadFileName, setUploadFileName] = useState<string | null>(null);
    const [uploadStatusText, setUploadStatusText] = useState("");

    const isPreparingUpload = uploadProgress !== null;

    /**
     * ============================================================================
     * New Folder Autofocus
     * ----------------------------------------------------------------------------
     * Focuses the folder name input after the New Folder panel is opened.
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

            <View style={styles.actionsArea}>
                <View style={styles.actions}>
                    {/* Theme Toggle */}

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="تغییر حالت روشن و تیره"
                        onPress={toggleTheme}
                        style={[
                            styles.themeToggleButton,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.themeToggleButtonText,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            {themeMode === "light" ? "Dark" : "Light"}
                        </Text>
                    </Pressable>

                    {/* Upload */}

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="بارگذاری فایل"
                        onPress={handlePickFile}
                        style={[
                            styles.actionButton,
                            isPreparingUpload && styles.disabledActionButton,
                            {
                                backgroundColor: colors.primary,
                            },
                        ]}
                        disabled={isPreparingUpload}
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
                        accessibilityRole="button"
                        accessibilityLabel="ساخت پوشه جدید"
                        onPress={onPressCreateFolder}
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

                {activeAction === "new-folder" && (
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
                                <Text
                                    style={[
                                        styles.actionPanelSecondaryButtonText,
                                        {
                                            color: colors.primary,
                                        },
                                    ]}
                                >
                                    بستن
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {isPreparingUpload && (
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
                            آماده‌سازی فایل
                        </Text>

                        <Text
                            style={[
                                styles.actionPanelDescription,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            {uploadStatusText}
                        </Text>

                        {uploadFileName && (
                            <Text
                                style={[
                                    styles.uploadFileName,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                                numberOfLines={1}
                            >
                                {uploadFileName}
                            </Text>
                        )}

                        <View
                            style={[
                                styles.uploadProgressTrack,
                                {
                                    backgroundColor: colors.background,
                                    borderColor: colors.border,
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

                        <Text
                            style={[
                                styles.uploadProgressText,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            {uploadProgress ?? 0}٪
                        </Text>
                    </View>
                )}
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
                    value={searchQuery}
                    onChangeText={onChangeSearchQuery}
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
        position: "relative",
        zIndex: 30,
        overflow: "visible",

        minHeight: spacing.toolbarHeight,

        flexDirection: "row-reverse",
        alignItems: "center",
        flexWrap: "wrap",
        alignContent: "center",

        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xs,

        columnGap: spacing.lg,
        rowGap: spacing.md,

        borderRadius: radius.lg,

        ...shadows.sm,
    },

    /**
     * ============================================================================
     * Toolbar Sections
     * ============================================================================
     */

    search: {
        flex: 1,
        flexShrink: 1,

        minWidth: 260,
    },

    searchInput: {
        height: 38,

        paddingHorizontal: spacing.lg,

        borderWidth: 1,
        borderRadius: radius.md,

        fontSize: typography.fontSize.md,
    },

    actionsArea: {
        position: "relative",
        flexShrink: 0,
    },

    actionPanel: {
        position: "absolute",
        top: spacing.xxl + spacing.xs,
        right: spacing.none,

        width: 360,

        padding: spacing.md,

        borderWidth: 1,
        borderRadius: radius.lg,

        zIndex: 20,

        ...shadows.md,
    },

    actionPanelTitle: {
        marginBottom: spacing.sm,

        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    actionPanelDescription: {
        marginBottom: spacing.md,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",

        opacity: 0.72,
    },

    actionPanelInput: {
        minHeight: 40,

        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,

        borderWidth: 1,
        borderRadius: radius.md,

        fontSize: typography.fontSize.sm,
        textAlign: "right",
    },

    actionPanelButtons: {
        flexDirection: "row-reverse",
        alignItems: "center",

        gap: spacing.sm,
    },

    actionPanelPrimaryButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,

        borderRadius: radius.md,
    },

    actionPanelPrimaryButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    actionPanelSecondaryButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.md,
    },

    actionPanelSecondaryButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    disabledActionButton: {
        opacity: 0.64,
    },

    uploadFileName: {
        marginBottom: spacing.sm,

        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        textAlign: "right",

        opacity: 0.72,
    },

    uploadProgressTrack: {
        height: 8,

        overflow: "hidden",

        marginBottom: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.pill,
    },

    uploadProgressFill: {
        height: "100%",

        borderRadius: radius.pill,
    },

    uploadProgressText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "left",

        opacity: 0.72,
    },

    actions: {
        flexDirection: "row",
        alignItems: "center",
        flexShrink: 0,

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

    themeToggleButton: {
        minHeight: 40,

        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: spacing.md,

        borderWidth: 1,
        borderRadius: radius.md,
    },

    themeToggleButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    user: {
        width: 180,

        flexDirection: "row-reverse",
        alignItems: "center",
        flexShrink: 0,
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

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
    Modal,
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
    canCreateWorkspaceItems: boolean;
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
}: ToolbarProps) {
    const { theme } = useSettings();
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
                    borderColor: colors.border,
                },
            ]}
        >
            {/* =========================================================================
            * User
            * ========================================================================= */}

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
                        Software Developer
                    </Text>
                </View>
            </View>

            {/* =========================================================================
            * Actions
            * ========================================================================= */}

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
                            <Text
                                style={[
                                    styles.actionSegmentPrimaryText,
                                    {
                                        color: colors.surface,
                                    },
                                ]}
                            >
                                Upload
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
                            <Text
                                style={[
                                    styles.actionSegmentSecondaryText,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                            >
                                New Folder
                            </Text>
                        </Pressable>
                    </View>

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

                    {isPreparingUpload && (
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
                    )}
                </View>
            )}

            {/* =========================================================================
            * Search
            * ========================================================================= */}

            <TextInput
                value={searchQuery}
                onChangeText={onChangeSearchQuery}
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
    );
}

/**
 * ============================================================================
 * Styles
 * ============================================================================
 */

const styles = StyleSheet.create({
    container: {
        minHeight: 72,

        flexDirection: "row-reverse",
        alignItems: "flex-start",

        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,

        borderRadius: radius.lg,
        borderWidth: 1,

        gap: spacing.md,

        ...shadows.sm,
    },

    user: {
        flexDirection: "row-reverse",
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
        flexDirection: "row-reverse",
        alignItems: "center",

        borderWidth: 1,
        borderRadius: radius.lg,

        overflow: "hidden",
    },

    actionSegmentButton: {
        minHeight: 42,

        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: spacing.lg,
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
        flex: 1,

        alignItems: "center",
        justifyContent: "center",

        padding: spacing.xl,

        backgroundColor: "rgba(0, 0, 0, 0.32)",
    },

    actionPanel: {
        width: 320,

        padding: spacing.lg,

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
        flexDirection: "row-reverse",
        alignItems: "center",

        marginTop: spacing.md,

        gap: spacing.sm,
    },

    actionPanelPrimaryButton: {
        minHeight: 36,

        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: spacing.md,

        borderRadius: radius.md,
    },

    actionPanelPrimaryButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    actionPanelSecondaryButton: {
        minHeight: 36,

        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: spacing.md,

        borderWidth: 1,
        borderRadius: radius.md,
    },

    actionPanelSecondaryButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    uploadPanel: {
        position: "absolute",
        top: 48,
        right: 0,
        zIndex: 10,

        width: 320,

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
    },
});

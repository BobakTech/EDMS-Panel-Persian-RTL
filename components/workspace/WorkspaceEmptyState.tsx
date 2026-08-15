/**
 * ============================================================================
 * Workspace Empty State
 * ----------------------------------------------------------------------------
 * Displays a clean upload-focused empty state.
 * On web, the upload area supports click-to-pick and drag-and-drop.
 * ============================================================================
 */

import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import { Feather } from "../../web/icons";

import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "../../web/ui";

import { radius, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

/**
 * ============================================================================
 * Types
 * ============================================================================
 */

export interface DroppedWorkspaceFile {
    name: string;
    size?: number;
    mimeType?: string;
    uri?: string;
}

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface WorkspaceEmptyStateProps {
    title?: string;
    description?: string;
    icon?: string;
    showHints?: boolean;
    primaryActionLabel?: string;
    secondaryActionLabel?: string;
    onPrimaryActionPress?: () => void;
    onSecondaryActionPress?: () => void;
    onFilesDrop?: (files: DroppedWorkspaceFile[]) => void;
}

/**
 * ============================================================================
 * Helpers
 * ============================================================================
 */

function getDroppedWorkspaceFiles(
    fileList: FileList | ArrayLike<File>
): DroppedWorkspaceFile[] {
    return Array.from(fileList, (file) => {
        let fileUri: string | undefined;

        if (
            Platform.OS === "web" &&
            typeof URL !== "undefined" &&
            typeof URL.createObjectURL === "function"
        ) {
            try {
                fileUri = URL.createObjectURL(file);
            } catch {
                fileUri = undefined;
            }
        }

        return {
            name: file.name,
            size: file.size,
            mimeType: file.type,
            uri: fileUri,
        };
    });
}

function isFileDragEvent(event: DragEvent) {
    return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function WorkspaceEmptyState({
    title = "هنوز سندی وجود ندارد",
    description = "برای شروع، فایل‌های خود را بارگذاری کنید یا یک پوشه جدید بسازید.",
    icon,
    showHints = true,
    primaryActionLabel,
    secondaryActionLabel,
    onPrimaryActionPress,
    onSecondaryActionPress,
    onFilesDrop,
}: WorkspaceEmptyStateProps) {
    const { theme } = useSettings();
    const colors = theme.colors;

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [isDraggingFile, setIsDraggingFile] = useState(false);

    const shouldShowUploadArea =
        Boolean(secondaryActionLabel) &&
        Boolean(onFilesDrop || onSecondaryActionPress);

    const shouldShowNewFolderAction =
        Boolean(primaryActionLabel && onPrimaryActionPress);

    useEffect(() => {
        if (Platform.OS !== "web" || !shouldShowUploadArea) {
            return;
        }

        function handleWindowDragOver(event: DragEvent) {
            if (!isFileDragEvent(event)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = "copy";
            }

            setIsDraggingFile(true);
        }

        function handleWindowDragLeave(event: DragEvent) {
            if (!isFileDragEvent(event)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            setIsDraggingFile(false);
        }

        function handleWindowDrop(event: DragEvent) {
            if (!event.dataTransfer?.files?.length) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            setIsDraggingFile(false);

            const droppedFiles = getDroppedWorkspaceFiles(
                event.dataTransfer.files
            );

            if (droppedFiles.length > 0) {
                onFilesDrop?.(droppedFiles);
            }
        }

        window.addEventListener("dragover", handleWindowDragOver, true);
        window.addEventListener("dragleave", handleWindowDragLeave, true);
        window.addEventListener("drop", handleWindowDrop, true);

        return () => {
            window.removeEventListener("dragover", handleWindowDragOver, true);
            window.removeEventListener("dragleave", handleWindowDragLeave, true);
            window.removeEventListener("drop", handleWindowDrop, true);
        };
    }, [onFilesDrop, shouldShowUploadArea]);

    function handlePressUploadArea() {
        if (Platform.OS === "web" && fileInputRef.current) {
            fileInputRef.current.click();
            return;
        }

        onSecondaryActionPress?.();
    }

    function handleFileInputChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const selectedFiles = event.target.files;

        if (!selectedFiles || selectedFiles.length === 0) {
            return;
        }

        onFilesDrop?.(getDroppedWorkspaceFiles(selectedFiles));

        event.target.value = "";
    }

    return (
        <View style={styles.emptyState}>
            {Platform.OS === "web" &&
                React.createElement("input", {
                    ref: fileInputRef,
                    type: "file",
                    multiple: true,
                    onChange: handleFileInputChange,
                    style: {
                        display: "none",
                    },
                })}

            {shouldShowUploadArea ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={secondaryActionLabel}
                    onPress={handlePressUploadArea}
                    style={({ pressed }) => [
                        styles.uploadDropZone,
                        pressed && styles.pressedAction,
                        {
                            backgroundColor: isDraggingFile
                                ? colors.surface
                                : colors.background,
                            borderColor: isDraggingFile
                                ? colors.primary
                                : colors.border,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.uploadIconBox,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Feather
                            name="upload-cloud"
                            size={30}
                            color={colors.primary}
                        />
                    </View>

                    <Text
                        style={[
                            styles.title,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {title}
                    </Text>

                    <Text
                        style={[
                            styles.description,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        فایل را اینجا بکشید و رها کنید یا برای بارگذاری کلیک کنید.
                    </Text>

                    <Text
                        style={[
                            styles.supportText,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        پشتیبانی از PDF، DOCX، XLSX، ZIP و سایر فایل‌های سازمانی
                    </Text>
                </Pressable>
            ) : (
                <View style={styles.simpleState}>
                    <View
                        style={[
                            styles.simpleIconBox,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.simpleIconText,
                                {
                                    color: colors.primary,
                                },
                            ]}
                        >
                            {icon ?? "؟"}
                        </Text>
                    </View>

                    <Text
                        style={[
                            styles.title,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {title}
                    </Text>

                    <Text
                        style={[
                            styles.description,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {description}
                    </Text>
                </View>
            )}

            {shouldShowNewFolderAction && (
                <View style={styles.footerActions}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={primaryActionLabel}
                        onPress={onPrimaryActionPress}
                        style={({ pressed }) => [
                            styles.newFolderButton,
                            pressed && styles.pressedAction,
                            {
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Feather
                            name="folder-plus"
                            size={16}
                            color={colors.text}
                        />

                        <Text
                            style={[
                                styles.newFolderButtonText,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            {primaryActionLabel}
                        </Text>
                    </Pressable>
                </View>
            )}

            {showHints && !shouldShowUploadArea && !shouldShowNewFolderAction && (
                <View style={styles.hints}>
                    <View
                        style={[
                            styles.hintChip,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.hintChipText,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            پوشه جدید
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.hintChip,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.hintChipText,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            بارگذاری فایل
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}

/**
 * ============================================================================
 * Styles
 * ============================================================================
 */

const styles = StyleSheet.create({
    emptyState: {
        flex: 1,

        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: spacing.xxl,
    },

    uploadDropZone: {
        width: "100%",
        maxWidth: 560,
        minHeight: 230,

        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.xl,

        borderWidth: 1,
        borderStyle: "dashed",
        borderRadius: radius.xl,
    },

    uploadIconBox: {
        width: 56,
        height: 56,

        alignItems: "center",
        justifyContent: "center",

        marginBottom: spacing.md,

        borderWidth: 1,
        borderRadius: radius.lg,
    },

    simpleState: {
        alignItems: "center",
        justifyContent: "center",
    },

    simpleIconBox: {
        width: 56,
        height: 56,

        alignItems: "center",
        justifyContent: "center",

        marginBottom: spacing.md,

        borderWidth: 1,
        borderRadius: radius.lg,
    },

    simpleIconText: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
    },

    title: {
        marginBottom: spacing.xs,

        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "center",
    },

    description: {
        maxWidth: 420,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "center",

        opacity: 0.72,
    },

    supportText: {
        marginTop: spacing.xs,

        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.regular,
        textAlign: "center",

        opacity: 0.56,
    },

    footerActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        marginTop: spacing.md,
    },

    newFolderButton: {
        minHeight: 38,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        gap: spacing.xs,

        paddingHorizontal: spacing.lg,

        borderWidth: 1,
        borderRadius: radius.md,
    },

    newFolderButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    pressedAction: {
        opacity: 0.72,
    },

    hints: {
        flexDirection: "row",
        alignItems: "center",

        marginTop: spacing.lg,

        gap: spacing.sm,
    },

    hintChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,

        borderWidth: 1,
        borderRadius: radius.pill,
    },

    hintChipText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
    },
});

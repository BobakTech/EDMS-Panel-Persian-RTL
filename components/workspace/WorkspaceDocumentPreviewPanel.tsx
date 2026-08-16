/**
 * ============================================================================
 * Workspace Document Preview Panel
 * ----------------------------------------------------------------------------
 * Shows a renderer-aware preview for the selected file item.
 * Image files render directly when a local URI is available.
 * ============================================================================
 */

import { Feather } from "../../web/icons";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "../../web/ui";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import PdfPreviewRenderer from "../preview/PdfPreviewRenderer.web";
import {
    getWorkspaceItemStatusLabel,
    getWorkspaceItemUpdatedAtLabel,
} from "./workspace.helpers";
import type { TranslationKey } from "../../locales";

import type { WorkspaceItem } from "./workspace.types";

/**
 * ============================================================================
 * Types
 * ============================================================================
 */

type FeatherIconName = keyof typeof Feather.glyphMap;

type PreviewRendererKind =
    | "pdf"
    | "image"
    | "office"
    | "text"
    | "generic";

interface PreviewRendererInfo {
    kind: PreviewRendererKind;
    icon: FeatherIconName;
    title: string;
    description: string;
}

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface WorkspaceDocumentPreviewPanelProps {
    item: WorkspaceItem;
    onClose: () => void;

    /**
     * Opens the selected file in the standalone document preview layout.
     */
    onOpenFullPreview?: (item: WorkspaceItem) => void;
}

/**
 * ============================================================================
 * File Helpers
 * ============================================================================
 */

function getNormalizedExtension(item: WorkspaceItem) {
    return item.extension?.replace(".", "").toLowerCase() ?? "";
}

function getNormalizedMimeType(item: WorkspaceItem) {
    return item.mimeType?.toLowerCase() ?? "";
}

type Translate = (key: TranslationKey) => string;

function getFileTypeLabel(item: WorkspaceItem, t: Translate) {
    const extension = getNormalizedExtension(item);

    return extension ? extension.toUpperCase() : t("file");
}

/**
 * ============================================================================
 * Preview Type Detection
 * ----------------------------------------------------------------------------
 * Determines the preview presentation type from file extension and MIME type.
 * ============================================================================
 */

function getPreviewRendererKind(item: WorkspaceItem): PreviewRendererKind {
    const extension = getNormalizedExtension(item);
    const mimeType = getNormalizedMimeType(item);

    if (extension === "pdf" || mimeType.includes("pdf")) {
        return "pdf";
    }

    if (
        mimeType.startsWith("image/") ||
        ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)
    ) {
        return "image";
    }

    if (
        mimeType.startsWith("text/") ||
        ["txt", "md", "csv", "json", "xml", "log"].includes(extension)
    ) {
        return "text";
    }

    if (
        [
            "doc",
            "docx",
            "xls",
            "xlsx",
            "ppt",
            "pptx",
            "odt",
            "ods",
            "odp",
        ].includes(extension) ||
        mimeType.includes("word") ||
        mimeType.includes("excel") ||
        mimeType.includes("powerpoint") ||
        mimeType.includes("spreadsheet") ||
        mimeType.includes("presentation")
    ) {
        return "office";
    }

    return "generic";
}

function getPreviewRendererInfo(item: WorkspaceItem, t: Translate): PreviewRendererInfo {
    const kind = getPreviewRendererKind(item);

    if (kind === "pdf") {
        return {
            kind,
            icon: "file-text",
            title: t("pdfPreviewTitle"),
            description: t("pdfPreviewDescription"),
        };
    }

    if (kind === "image") {
        return {
            kind,
            icon: "image",
            title: t("imagePreviewTitle"),
            description: item.localUri
                ? t("imagePreviewReady")
                : t("imagePreviewUnavailable"),
        };
    }

    if (kind === "office") {
        return {
            kind,
            icon: "file",
            title: t("officePreviewTitle"),
            description: t("officePreviewDescription"),
        };
    }

    if (kind === "text") {
        return {
            kind,
            icon: "align-right",
            title: t("textPreviewTitle"),
            description: t("textPreviewDescription"),
        };
    }

    return {
        kind,
        icon: "file",
        title: t("genericPreviewTitle"),
        description: t("genericPreviewDescription"),
    };
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function WorkspaceDocumentPreviewPanel({
    item,
    onClose,
    onOpenFullPreview,
}: WorkspaceDocumentPreviewPanelProps) {
    const { direction, language, t, theme } = useSettings();
    const colors = theme.colors;
    const textAlign = direction === "rtl" ? "right" : "left";
    const rendererInfo = getPreviewRendererInfo(item, t);
    const shouldRenderImage =
        rendererInfo.kind === "image" && Boolean(item.localUri);
    const shouldRenderPdf =
        rendererInfo.kind === "pdf" && Boolean(item.localUri);

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    direction,
                },
            ]}
        >
            <View style={styles.topRow}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("closePreview")}
                    onPress={onClose}
                    style={[
                        styles.closeButton,
                        {
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                        },
                    ]}
                >
                    <Feather name="x" size={15} color={colors.text} />
                </Pressable>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("openFullPreview")}
                    onPress={() => onOpenFullPreview?.(item)}
                    style={[
                        styles.fullPreviewButton,
                        {
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                        },
                    ]}
                >
                    <Feather name="maximize-2" size={14} color={colors.primary} />

                    <Text
                        style={[
                            styles.fullPreviewButtonText,
                            {
                                color: colors.primary,
                                textAlign,
                            },
                        ]}
                    >
                        {t("fullPreview")}
                    </Text>
                </Pressable>

                <View style={styles.titleArea}>
                    <Text
                        style={[
                            styles.eyebrow,
                            {
                                color: colors.primary,
                                textAlign,
                            },
                        ]}
                    >
                        {t("documentPreview")}
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={[
                            styles.title,
                            {
                                color: colors.text,
                                textAlign,
                            },
                        ]}
                    >
                        {item.name}
                    </Text>
                </View>
            </View>

            <View
                style={[
                    shouldRenderImage || shouldRenderPdf
                        ? styles.imagePreviewFrame
                        : styles.previewRow,
                    {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                    },
                ]}
            >
                {shouldRenderImage ? (
                    <Image
                        source={{ uri: item.localUri }}
                        resizeMode="contain"
                        style={styles.imagePreview}
                    />
                ) : shouldRenderPdf && item.localUri ? (
                    <PdfPreviewRenderer
                        uri={item.localUri}
                        title={item.name}
                        height={520}
                        backgroundColor={colors.background}
                        borderColor={colors.border}
                    />
                ) : (
                    <>
                        <View
                            style={[
                                styles.previewIcon,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <Feather
                                name={rendererInfo.icon}
                                size={24}
                                color={colors.primary}
                            />
                        </View>

                        <View style={styles.previewTextArea}>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.previewTitle,
                                    {
                                        color: colors.text,
                                        textAlign,
                                    },
                                ]}
                            >
                                {rendererInfo.title}
                            </Text>

                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.previewDescription,
                                    {
                                        color: colors.text,
                                        textAlign,
                                    },
                                ]}
                            >
                                {rendererInfo.description}
                            </Text>
                        </View>
                    </>
                )}
            </View>

            <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                    <Text
                        style={[
                            styles.metaLabel,
                            {
                                color: colors.text,
                                textAlign,
                            },
                        ]}
                    >
                        {t("fileType")}
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={[
                            styles.metaValue,
                            {
                                color: colors.text,
                                textAlign,
                            },
                        ]}
                    >
                        {getFileTypeLabel(item, t)}
                    </Text>
                </View>

                <View style={styles.metaItem}>
                    <Text
                        style={[
                            styles.metaLabel,
                            {
                                color: colors.text,
                                textAlign,
                            },
                        ]}
                    >
                        {t("fileSize")}
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={[
                            styles.metaValue,
                            {
                                color: colors.text,
                                textAlign,
                            },
                        ]}
                    >
                        {getWorkspaceItemUpdatedAtLabel(item, t, language)}
                    </Text>
                </View>

                <View style={styles.metaItem}>
                    <Text
                        style={[
                            styles.metaLabel,
                            {
                                color: colors.text,
                                textAlign,
                            },
                        ]}
                    >
                        {direction === "ltr" ? "Status" : t("status")}
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={[
                            styles.metaValue,
                            {
                                color: colors.text,
                                textAlign,
                            },
                        ]}
                    >
                        {getWorkspaceItemStatusLabel(item, direction, t)}
                    </Text>
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
        width: "100%",
        marginTop: spacing.sm,
        marginBottom: spacing.md,
        padding: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.lg,

        ...shadows.sm,
    },

    topRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },

    closeButton: {
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.pill,
    },

    titleArea: {
        flex: 1,
        minWidth: 0,
    },

    eyebrow: {
        marginBottom: 2,

        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    title: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        textAlign: "right",
    },

    previewRow: {
        minHeight: 74,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,

        marginBottom: spacing.sm,
        padding: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.md,
        borderStyle: "dashed",
    },

    /**
     * ============================================================================
     * Image Preview Frame
     * ----------------------------------------------------------------------------
     * Gives uploaded images enough space while keeping them contained.
     * ============================================================================
     */

    imagePreviewFrame: {
        minHeight: 420,
        alignItems: "center",
        justifyContent: "center",

        marginBottom: spacing.sm,
        padding: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.md,
        overflow: "hidden",
    },

    /**
     * ============================================================================
     * Image Preview
     * ----------------------------------------------------------------------------
     * Renders the image larger inside the expanded workspace preview.
     * ============================================================================
     */

    imagePreview: {
        width: "100%",
        height: 520,
    },

    previewIcon: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.md,
    },

    previewTextArea: {
        flex: 1,
        minWidth: 0,
    },

    previewTitle: {
        marginBottom: 2,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        textAlign: "right",
    },

    previewDescription: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",
        opacity: 0.72,
    },

    metaRow: {
        flexDirection: "row",
        gap: spacing.sm,
    },

    metaItem: {
        flex: 1,
        minWidth: 0,
        gap: 2,
    },

    metaLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
        opacity: 0.64,
    },

    metaValue: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        textAlign: "right",
    },

    fullPreviewButton: {
        minHeight: 32,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,

        paddingHorizontal: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.md,
    },

    fullPreviewButtonText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
    },
});

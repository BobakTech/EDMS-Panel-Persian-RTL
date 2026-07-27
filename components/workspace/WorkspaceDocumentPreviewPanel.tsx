/**
 * ============================================================================
 * Workspace Document Preview Panel
 * ----------------------------------------------------------------------------
 * Shows a renderer-aware preview for the selected file item.
 * Image files render directly when a local URI is available.
 * ============================================================================
 */

import { Feather } from "@expo/vector-icons";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

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

function getFileTypeLabel(item: WorkspaceItem) {
    const extension = getNormalizedExtension(item);

    return extension ? extension.toUpperCase() : "فایل";
}

function getFileSizeLabel(item: WorkspaceItem) {
    return item.sizeLabel ?? "اندازه نامشخص";
}

function getFileStatusLabel(item: WorkspaceItem) {
    if (item.status === "archived") {
        return "آرشیو شده";
    }

    if (item.status === "trashed") {
        return "در سطل زباله";
    }

    return "فعال";
}

/**
 * ============================================================================
 * Preview Renderer Detection
 * ----------------------------------------------------------------------------
 * Detects the preview renderer from extension and MIME type.
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

function getPreviewRendererInfo(item: WorkspaceItem): PreviewRendererInfo {
    const kind = getPreviewRendererKind(item);

    if (kind === "pdf") {
        return {
            kind,
            icon: "file-text",
            title: "پیش‌نمایش PDF",
            description: "رندر PDF در مرحله بعد فعال می‌شود.",
        };
    }

    if (kind === "image") {
        return {
            kind,
            icon: "image",
            title: "پیش‌نمایش تصویر",
            description: item.localUri
                ? "تصویر انتخاب‌شده آماده نمایش است."
                : "آدرس محلی تصویر در دسترس نیست.",
        };
    }

    if (kind === "office") {
        return {
            kind,
            icon: "file",
            title: "پیش‌نمایش سند اداری",
            description: "نمایش Word، Excel و PowerPoint در مرحله بعد اضافه می‌شود.",
        };
    }

    if (kind === "text") {
        return {
            kind,
            icon: "align-right",
            title: "پیش‌نمایش متن",
            description: "نمایش محتوای متنی در مرحله بعد اضافه می‌شود.",
        };
    }

    return {
        kind,
        icon: "file",
        title: "پیش‌نمایش فایل",
        description: "برای این نوع فایل هنوز renderer اختصاصی تعریف نشده است.",
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
}: WorkspaceDocumentPreviewPanelProps) {
    const { theme } = useSettings();
    const colors = theme.colors;
    const rendererInfo = getPreviewRendererInfo(item);
    const shouldRenderImage =
        rendererInfo.kind === "image" && Boolean(item.localUri);

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
            <View style={styles.topRow}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="بستن پیش‌نمایش"
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

                <View style={styles.titleArea}>
                    <Text
                        style={[
                            styles.eyebrow,
                            {
                                color: colors.primary,
                            },
                        ]}
                    >
                        پیش‌نمایش سند
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={[
                            styles.title,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {item.name}
                    </Text>
                </View>
            </View>

            <View
                style={[
                    shouldRenderImage
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
                            },
                        ]}
                    >
                        نوع فایل
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={[
                            styles.metaValue,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {getFileTypeLabel(item)}
                    </Text>
                </View>

                <View style={styles.metaItem}>
                    <Text
                        style={[
                            styles.metaLabel,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        اندازه فایل
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={[
                            styles.metaValue,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {getFileSizeLabel(item)}
                    </Text>
                </View>

                <View style={styles.metaItem}>
                    <Text
                        style={[
                            styles.metaLabel,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        وضعیت
                    </Text>

                    <Text
                        numberOfLines={1}
                        style={[
                            styles.metaValue,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {getFileStatusLabel(item)}
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
        flexDirection: "row-reverse",
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
        flexDirection: "row-reverse",
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
});

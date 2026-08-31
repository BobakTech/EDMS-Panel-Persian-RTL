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
    Pressable,
    StyleSheet,
    Text,
    View,
} from "../../web/ui";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";
import WorkspacePreviewRenderer from "../preview/WorkspacePreviewRenderer";
import {
    getPreviewRendererKind,
    getWorkspaceFileTypeLabel,
    hasRenderableWorkspacePreview,
    type PreviewRendererKind,
} from "../preview/preview.helpers";
import {
    getWorkspaceFileExtension,
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

type Translate = (key: TranslationKey) => string;

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
    const { textAlign } = getDirectionalLayout(direction);
    const rendererInfo = getPreviewRendererInfo(item, t);
    const hasRenderablePreview = hasRenderableWorkspacePreview(item);

    const fileTypeLabel =
        item.type === "file"
            ? (
                item.extension ??
                getWorkspaceFileExtension(item.name)
            ).toUpperCase()
            : t("folder");

    const rawFileSizeLabel =
        getWorkspaceItemUpdatedAtLabel(item, t, language);

    const fileSizeLabel =
        item.type === "file" &&
            /^\d+(?:[.,]\d+)?$/.test(rawFileSizeLabel.trim())
            ? `${rawFileSizeLabel} MB`
            : rawFileSizeLabel;

    const fileStatusLabel =
        getWorkspaceItemStatusLabel(item, direction, t);

    return (
        <View
            className="workspace-motion-panel"
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
                    hasRenderablePreview
                        ? styles.imagePreviewFrame
                        : styles.previewRow,
                    {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                    },
                ]}
            >
                <WorkspacePreviewRenderer
                    item={item}
                    imageStyle={styles.imagePreview}
                    pdfHeight={520}
                    borderColor={colors.border}
                    fallback={
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
                    }
                />
            </View>

            <View style={styles.metaRow}>
                <Text
                    style={[
                        styles.metaValue,
                        {
                            color: colors.text,
                            textAlign,
                        },
                    ]}
                >
                    {fileTypeLabel}
                </Text>

                <Text
                    style={[
                        styles.metaSeparator,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    •
                </Text>

                <Text
                    style={[
                        styles.metaValue,
                        {
                            color: colors.text,
                            textAlign,
                        },
                    ]}
                >
                    {fileSizeLabel}
                </Text>

                <Text
                    style={[
                        styles.metaSeparator,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    •
                </Text>

                <Text
                    style={[
                        styles.metaValue,
                        {
                            color: colors.text,
                            textAlign,
                        },
                    ]}
                >
                    {fileStatusLabel}
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
        width: "100%",
        marginTop: spacing.md,
        marginBottom: spacing.lg,
        padding: spacing.md,

        borderWidth: 1,
        borderRadius: radius.lg,

        animation:
            "edms-workspace-panel-in 160ms cubic-bezier(0.2, 0.8, 0.2, 1)",

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
        order: 2,

        width: "100%",
        minHeight: 112,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",

        gap: spacing.md,

        padding: spacing.md,

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
        order: 2,

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
        order: 1,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        flexWrap: "wrap",

        gap: spacing.xs,

        marginBottom: spacing.sm,
    },

    metaValue: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",

        opacity: 0.78,
    },

    metaSeparator: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.regular,

        opacity: 0.36,
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

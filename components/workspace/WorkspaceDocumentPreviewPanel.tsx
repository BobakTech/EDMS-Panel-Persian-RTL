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
    hasRenderableWorkspacePreview,
    type PreviewRendererKind,
} from "../preview/preview.helpers";
import { getPreviewMetadataPresentation } from "../preview/preview.metadata";
import type { TranslationKey } from "../../locales";

import type { WorkspaceItem } from "./workspace.types";

type FeatherIconName = keyof typeof Feather.glyphMap;

interface PreviewRendererInfo {
    kind: PreviewRendererKind;
    icon: FeatherIconName;
    title: string;
    description: string;
}

interface WorkspaceDocumentPreviewPanelProps {
    item: WorkspaceItem;
    onClose: () => void;
    onOpenFullPreview?: (item: WorkspaceItem) => void;
}

type Translate = (key: TranslationKey) => string;

function getPreviewRendererInfo(
    item: WorkspaceItem,
    t: Translate
): PreviewRendererInfo {
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
    const metadata = getPreviewMetadataPresentation(
        item,
        direction,
        t,
        language,
    );

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
                        dir="auto"
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

            <View style={styles.metaRow}>
                <View
                    style={[
                        styles.statusChip,
                        {
                            backgroundColor: metadata.status.backgroundColor,
                            borderColor: metadata.status.borderColor,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.metaLabel,
                            {
                                color: metadata.status.foregroundColor,
                                textAlign,
                            },
                        ]}
                    >
                        {metadata.status.label}
                    </Text>

                    <Text
                        style={[
                            styles.statusValue,
                            {
                                color: metadata.status.foregroundColor,
                                textAlign,
                            },
                        ]}
                    >
                        {metadata.status.value}
                    </Text>
                </View>

                {metadata.entries.map((entry) => (
                    <View
                        key={entry.key}
                        style={[
                            styles.metaChip,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.metaLabel,
                                {
                                    color: colors.text,
                                    textAlign,
                                },
                            ]}
                        >
                            {entry.label}
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
                            {entry.value}
                        </Text>
                    </View>
                ))}
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
        </View>
    );
}

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
        width: "100%",
        minWidth: 0,

        flexDirection: "row",
        alignItems: "center",

        gap: spacing.sm,
        marginBottom: spacing.sm,
    },

    closeButton: {
        width: 32,
        height: 32,

        flexShrink: 0,

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
        width: "100%",
        minWidth: 0,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,

        textAlign: "right",

        whiteSpace: "normal",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
    },

    metaRow: {
        width: "100%",

        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "stretch",

        gap: spacing.xs,
        marginBottom: spacing.sm,
    },

    metaChip: {
        minWidth: 96,
        maxWidth: "100%",

        flexGrow: 1,
        flexBasis: 110,

        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,

        borderWidth: 1,
        borderRadius: radius.md,
    },

    statusChip: {
        minWidth: 104,
        maxWidth: "100%",

        flexGrow: 1,
        flexBasis: 110,

        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,

        borderWidth: 1,
        borderRadius: radius.md,
    },

    metaLabel: {
        marginBottom: 2,

        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.regular,

        opacity: 0.68,
    },

    metaValue: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
    },

    statusValue: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
    },

    previewRow: {
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

    imagePreviewFrame: {
        minHeight: 420,

        alignItems: "center",
        justifyContent: "center",

        padding: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.md,
        overflow: "hidden",
    },

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

    fullPreviewButton: {
        minHeight: 32,

        flexShrink: 0,

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

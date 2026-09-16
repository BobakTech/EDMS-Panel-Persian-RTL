/**
 * ============================================================================
 * Workspace Document Preview Panel
 * ----------------------------------------------------------------------------
 * Shows a renderer-aware preview for the selected file item.
 * Image files render directly when a local URI is available.
 * ============================================================================
 */

import { useEffect, useState } from "react";

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

import type {
    WorkspaceCategoryDefinition,
    WorkspaceItem,
    WorkspaceItemUpdate,
} from "./workspace.types";

import EdmsSelect from "../common/EdmsSelect";

type FeatherIconName = keyof typeof Feather.glyphMap;

interface PreviewRendererInfo {
    kind: PreviewRendererKind;
    icon: FeatherIconName;
    title: string;
    description: string;
}

interface WorkspaceDocumentPreviewPanelProps {
    item: WorkspaceItem;
    categoryDefinitions: WorkspaceCategoryDefinition[];
    onClose: () => void;
    onOpenFullPreview?: (item: WorkspaceItem) => void;
    onUpdateItem?: (itemId: string, updates: WorkspaceItemUpdate) => void;
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

function splitFileName(fileName: string) {
    const lastDotIndex = fileName.lastIndexOf(".");

    if (
        lastDotIndex <= 0 ||
        lastDotIndex === fileName.length - 1
    ) {
        return {
            baseName: fileName,
            extension: "",
        };
    }

    return {
        baseName: fileName.slice(0, lastDotIndex),
        extension: fileName.slice(lastDotIndex),
    };
}

export default function WorkspaceDocumentPreviewPanel({
    item,
    categoryDefinitions,
    onClose,
    onOpenFullPreview,
    onUpdateItem,
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

    /**
     * File Type options come from the File Categories API definitions.
     * Keep the file's currently assigned category available and selected even
     * if that category is temporarily missing from the returned definitions.
     */
    const assignedCategoryId = String(item.categoryId ?? "").trim();

    const fileCategoryOptions = [
        ...categoryDefinitions
            .map((category) => ({
                ...category,
                id: String(category.id ?? "").trim(),
            }))
            .filter((category) => category.id),
    ];

    if (
        assignedCategoryId &&
        !fileCategoryOptions.some(
            (category) => category.id === assignedCategoryId
        )
    ) {
        fileCategoryOptions.unshift({
            id: assignedCategoryId,
            nameFa: item.fileTypeLabel?.trim() || assignedCategoryId,
            nameEn: item.fileTypeLabel?.trim() || assignedCategoryId,
            order: -1,
        });
    }

    function getCategoryLabel(category: WorkspaceCategoryDefinition) {
        return direction === "rtl"
            ? category.nameFa?.trim() ||
            category.nameEn?.trim() ||
            category.id
            : category.nameEn?.trim() ||
            category.nameFa?.trim() ||
            category.id;
    }

    const [isEditing, setIsEditing] = useState(false);
    const [draftName, setDraftName] = useState(
        splitFileName(item.name).baseName
    );
    const [draftVersion, setDraftVersion] = useState(item.fileVersion ?? "");
    const [draftDate, setDraftDate] = useState(item.fileDate ?? "");
    const [draftTime, setDraftTime] = useState(item.fileTime ?? "");
    const [draftFileTypeLabel, setDraftFileTypeLabel] = useState(
        item.fileTypeLabel ?? ""
    );
    const [draftCategoryId, setDraftCategoryId] = useState(
        String(item.categoryId ?? "").trim()
    );

    useEffect(() => {
        setIsEditing(false);
        setDraftName(splitFileName(item.name).baseName);
        setDraftVersion(item.fileVersion ?? "");
        setDraftDate(item.fileDate ?? "");
        setDraftTime(item.fileTime ?? "");
        setDraftFileTypeLabel(item.fileTypeLabel ?? "");
        setDraftCategoryId(String(item.categoryId ?? "").trim());
    }, [
        item.id,
        item.name,
        item.fileVersion,
        item.fileDate,
        item.fileTime,
        item.fileTypeLabel,
        item.categoryId,
    ]);

    function handleStartEdit() {
        setDraftName(splitFileName(item.name).baseName);
        setDraftVersion(item.fileVersion ?? "");
        setDraftDate(item.fileDate ?? "");
        setDraftTime(item.fileTime ?? "");
        setDraftFileTypeLabel(item.fileTypeLabel ?? "");
        setDraftCategoryId(String(item.categoryId ?? "").trim());
        setIsEditing(true);
    }

    function handleCancelEdit() {
        setDraftName(splitFileName(item.name).baseName);
        setDraftVersion(item.fileVersion ?? "");
        setDraftDate(item.fileDate ?? "");
        setDraftTime(item.fileTime ?? "");
        setDraftFileTypeLabel(item.fileTypeLabel ?? "");
        setDraftCategoryId(String(item.categoryId ?? "").trim());
        setIsEditing(false);
    }

    function handleSaveEdit() {
        if (!onUpdateItem) {
            return;
        }

        const trimmedBaseName = draftName.trim();

        if (!trimmedBaseName) {
            return;
        }

        const { extension } = splitFileName(item.name);
        const updatedName = `${trimmedBaseName}${extension}`;

        onUpdateItem(item.id, {
            name: updatedName,
            fileVersion: draftVersion.trim(),
            fileDate: draftDate.trim(),
            fileTime: draftTime.trim(),
            fileTypeLabel: draftFileTypeLabel.trim(),
            categoryId: draftCategoryId || undefined,
        });

        setIsEditing(false);
    }

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

                {onUpdateItem && !isEditing && (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                            direction === "rtl"
                                ? "ویرایش اطلاعات سند"
                                : "Edit document details"
                        }
                        onPress={handleStartEdit}
                        style={[
                            styles.editButton,
                            {
                                borderColor: colors.border,
                                backgroundColor: colors.background,
                            },
                        ]}
                    >
                        <Feather
                            name="edit-3"
                            size={14}
                            color={colors.primary}
                        />

                        <Text
                            style={[
                                styles.editButtonText,
                                {
                                    color: colors.primary,
                                    textAlign,
                                },
                            ]}
                        >
                            {direction === "rtl" ? "ویرایش" : "Edit"}
                        </Text>
                    </Pressable>
                )}

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

                    {isEditing ? (
                        <View
                            style={{
                                width: "100%",
                                minWidth: 0,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                direction: "ltr",
                            }}
                        >
                            <input
                                value={draftName}
                                onChange={(event) =>
                                    setDraftName(event.target.value)
                                }
                                dir="ltr"
                                aria-label={
                                    direction === "rtl"
                                        ? "نام فایل"
                                        : "File name"
                                }
                                style={{
                                    flex: 1,
                                    width: "100%",
                                    minWidth: 0,
                                    minHeight: 34,
                                    paddingInline: 10,
                                    paddingBlock: 6,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.md,
                                    backgroundColor: colors.background,
                                    color: colors.text,
                                    fontSize: typography.fontSize.sm,
                                    fontWeight: typography.fontWeight.medium,
                                    outline: "none",
                                }}
                            />

                            {splitFileName(item.name).extension && (
                                <Text
                                    dir="ltr"
                                    style={{
                                        color: colors.text,
                                        fontSize: typography.fontSize.sm,
                                        fontWeight: typography.fontWeight.medium,
                                        flexShrink: 0,
                                    }}
                                >
                                    {splitFileName(item.name).extension}
                                </Text>
                            )}
                        </View>
                    ) : (
                        <Text
                            dir="ltr"
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
                    )}
                </View>
            </View>

            {!isEditing && (
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
            )}

            {isEditing && (
                <View
                    style={[
                        styles.editPanel,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <View style={styles.editGrid}>
                        <label
                            style={{
                                minWidth: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: spacing.xs,
                            }}
                        >
                            <span
                                style={{
                                    color: colors.text,
                                    fontSize: typography.fontSize.xs,
                                    fontWeight: typography.fontWeight.semibold,
                                    opacity: 0.72,
                                }}
                            >
                                {direction === "rtl" ? "نسخه" : "Version"}
                            </span>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={draftVersion}
                                onChange={(event) =>
                                    setDraftVersion(event.target.value)
                                }
                                onBlur={() => {
                                    const value = Number(draftVersion);

                                    if (Number.isFinite(value)) {
                                        setDraftVersion(value.toFixed(2));
                                    }
                                }}
                                dir="ltr"
                                style={{
                                    ...styles.editInput,
                                    borderColor: colors.border,
                                    backgroundColor: colors.surface,
                                    color: colors.text,
                                }}
                            />
                        </label>

                        <label
                            style={{
                                minWidth: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: spacing.xs,
                            }}
                        >
                            <span
                                style={{
                                    color: colors.text,
                                    fontSize: typography.fontSize.xs,
                                    fontWeight: typography.fontWeight.semibold,
                                    opacity: 0.72,
                                }}
                            >
                                {direction === "rtl" ? "تاریخ" : "Date"}
                            </span>

                            <input
                                value={draftDate}
                                onChange={(event) =>
                                    setDraftDate(event.target.value)
                                }
                                dir="auto"
                                style={{
                                    ...styles.editInput,
                                    borderColor: colors.border,
                                    backgroundColor: colors.surface,
                                    color: colors.text,
                                }}
                            />
                        </label>

                        <label
                            style={{
                                minWidth: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: spacing.xs,
                            }}
                        >
                            <span
                                style={{
                                    color: colors.text,
                                    fontSize: typography.fontSize.xs,
                                    fontWeight: typography.fontWeight.semibold,
                                    opacity: 0.72,
                                }}
                            >
                                {direction === "rtl" ? "زمان" : "Time"}
                            </span>

                            <input
                                type="time"
                                step="1"
                                value={draftTime}
                                onChange={(event) =>
                                    setDraftTime(event.target.value)
                                }
                                dir="ltr"
                                style={{
                                    ...styles.editInput,
                                    borderColor: colors.border,
                                    backgroundColor: colors.surface,
                                    color: colors.text,
                                }}
                            />
                        </label>

                        <label
                            style={{
                                minWidth: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: spacing.xs,
                            }}
                        >
                            <span
                                style={{
                                    color: colors.text,
                                    fontSize: typography.fontSize.xs,
                                    fontWeight: typography.fontWeight.semibold,
                                    opacity: 0.72,
                                }}
                            >
                                {direction === "rtl" ? "نوع فایل" : "File type"}
                            </span>

                            <EdmsSelect
                                value={draftCategoryId}
                                options={fileCategoryOptions.map((category) => ({
                                    value: category.id,
                                    label: getCategoryLabel(category),
                                }))}
                                onChange={(value) => {
                                    const selectedCategoryId = String(value).trim();

                                    const selectedCategory = fileCategoryOptions.find(
                                        (category) => category.id === selectedCategoryId
                                    );

                                    setDraftCategoryId(selectedCategoryId);

                                    setDraftFileTypeLabel(
                                        selectedCategory
                                            ? getCategoryLabel(selectedCategory)
                                            : ""
                                    );
                                }}
                                ariaLabel={
                                    direction === "rtl"
                                        ? "نوع فایل"
                                        : "File type"
                                }
                                placeholder={
                                    direction === "rtl"
                                        ? "انتخاب دسته‌بندی"
                                        : "Select category"
                                }
                                height={32}
                                maxMenuHeight={240}
                            />
                        </label>
                    </View>

                    <View style={styles.editActions}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={
                                direction === "rtl"
                                    ? "ذخیره تغییرات"
                                    : "Save changes"
                            }
                            disabled={!draftName.trim()}
                            onPress={handleSaveEdit}
                            style={({ pressed }) => [
                                styles.saveButton,
                                {
                                    backgroundColor: colors.primary,
                                    borderColor: colors.primary,
                                },
                                !draftName.trim() && styles.disabledButton,
                                pressed &&
                                Boolean(draftName.trim()) &&
                                styles.pressedButton,
                            ]}
                        >
                            <Feather name="check" size={14} color="#ffffff" />

                            <Text style={styles.saveButtonText}>
                                {direction === "rtl" ? "ذخیره" : "Save"}
                            </Text>
                        </Pressable>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={
                                direction === "rtl"
                                    ? "انصراف از ویرایش"
                                    : "Cancel editing"
                            }
                            onPress={handleCancelEdit}
                            style={({ pressed }) => [
                                styles.cancelButton,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                },
                                pressed && styles.pressedButton,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.cancelButtonText,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                            >
                                {direction === "rtl" ? "انصراف" : "Cancel"}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            )}

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

    editButton: {
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

    editButtonText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
    },

    editPanel: {
        width: "100%",
        marginBottom: spacing.sm,
        padding: spacing.sm,
        borderWidth: 1,
        borderRadius: radius.md,
        gap: spacing.sm,
    },

    editGrid: {
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: spacing.sm,
    },

    editField: {
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: spacing.xs,
    },

    editInput: {
        width: "100%",
        minWidth: 0,
        minHeight: 34,
        paddingInline: 10,
        paddingBlock: 6,
        borderWidth: 1,
        borderStyle: "solid",
        borderRadius: radius.md,
        fontSize: typography.fontSize.sm,
        outline: "none",
    },

    editActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
    },

    saveButton: {
        minHeight: 34,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderRadius: radius.md,
    },

    saveButtonText: {
        color: "#ffffff",
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
    },

    cancelButton: {
        minHeight: 34,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderRadius: radius.md,
    },

    cancelButtonText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
    },

    disabledButton: {
        opacity: 0.45,
    },

    pressedButton: {
        opacity: 0.82,
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

/**
 * ============================================================================
 * Document Preview Page
 * ----------------------------------------------------------------------------
 * Displays the standalone preview workspace for a selected document.
 * Keeps the preview area independent from the main workspace grid/list layout.
 * ============================================================================
 */

import { useState } from "react";

import { Feather } from "../../web/icons";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "../../web/ui";

import {
    radius,
    semanticColors,
    shadows,
    spacing,
    typography,
} from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";
import Tooltip from "../common/Tooltip";
import WorkspacePreviewRenderer from "../preview/WorkspacePreviewRenderer";
import WorkspaceMetadataDialog from "../preview/WorkspaceMetadataDialog";
import { getPreviewMetadataPresentation } from "../preview/preview.metadata";

import type {
    WorkspaceCategoryDefinition,
    WorkspaceItem,
    WorkspaceItemUpdate,
} from "../workspace";


interface DocumentPreviewPageProps {
    item: WorkspaceItem;
    categoryDefinitions: WorkspaceCategoryDefinition[];
    onBack: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    onUpdateItem?: (itemId: string, updates: WorkspaceItemUpdate) => void;
}

export default function DocumentPreviewPage({
    item,
    categoryDefinitions,
    onBack,
    onPrevious,
    onNext,
    onUpdateItem,
}: DocumentPreviewPageProps) {
    const { direction, language, t, theme } = useSettings();
    const { width } = useWindowDimensions();
    const colors = theme.colors;

    const isPhonePreview = width < 430;
    const isCompactPreview = width < 920;
    const { isRtl, textAlign } = getDirectionalLayout(direction);

    const previewPageInset = isPhonePreview
        ? spacing.sm
        : isCompactPreview
            ? spacing.lg
            : spacing.xl;

    const primaryForeground = semanticColors.onAccent;

    const backIcon = isRtl ? "arrow-right" : "arrow-left";
    const previousIcon = isRtl ? "chevron-right" : "chevron-left";
    const nextIcon = isRtl ? "chevron-left" : "chevron-right";

    const canAccessOriginal = Boolean(item.localUri);

    const metadata = getPreviewMetadataPresentation(
        item,
        direction,
        t,
        language,
    );

    const [isInformationOpen, setIsInformationOpen] = useState(false);
    const [informationMode, setInformationMode] = useState<"view" | "edit">("view");
    function openInformation(mode: "view" | "edit") { setInformationMode(mode); setIsInformationOpen(true); }

    function handleOpenOriginal() {
        if (!item.localUri) {
            return;
        }

        const openLink = document.createElement("a");
        openLink.href = item.localUri;
        openLink.target = "_blank";
        openLink.rel = "noopener noreferrer";

        document.body.appendChild(openLink);
        openLink.click();
        openLink.remove();
    }

    function handleDownloadOriginal() {
        if (!item.localUri) {
            return;
        }

        const downloadLink = document.createElement("a");
        downloadLink.href = item.localUri;
        downloadLink.download = item.name;
        downloadLink.rel = "noopener";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={[
                styles.content,
                {
                    paddingHorizontal: previewPageInset,
                },
            ]}
            showsVerticalScrollIndicator
            showsHorizontalScrollIndicator={false}
            dir={direction}
        >
            <View
                style={[
                    styles.topPanel,
                    isPhonePreview && styles.phoneTopPanel,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View
                    style={[
                        styles.topMainRow,
                        isPhonePreview && styles.phoneTopMainRow,
                    ]}
                >
                    <Tooltip label={t("backToWorkspace")}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t("backToWorkspace")}
                            onPress={onBack}
                            style={({ pressed }) => [
                                styles.compactButton,
                                {
                                    backgroundColor: colors.primary,
                                    borderColor: colors.primary,
                                },
                                pressed && styles.pressedButton,
                            ]}
                        >
                            <Feather
                                name={backIcon}
                                size={15}
                                color={primaryForeground}
                            />

                            <Text
                                style={[
                                    styles.compactButtonText,
                                    {
                                        color: primaryForeground,
                                    },
                                ]}
                            >
                                {t("back")}
                            </Text>
                        </Pressable>
                    </Tooltip>

                    <View style={styles.headerText}>
                        <Text
                            style={[
                                styles.eyebrow,
                                {
                                    color: colors.primary,
                                    textAlign,
                                },
                            ]}
                        >
                            {t("fullPreview")}
                        </Text>

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
                    </View>

                    <View style={styles.compactActions}>
                        {onUpdateItem && (
                            <Tooltip label={direction === "rtl" ? "ویرایش اطلاعات سند" : "Edit document details"}>
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={
                                        direction === "rtl"
                                            ? "ویرایش اطلاعات سند"
                                            : "Edit document details"
                                    }
                                    onPress={() => openInformation("edit")}
                                    style={({ pressed }) => [
                                        styles.iconActionButton,
                                        {
                                            backgroundColor: colors.background,
                                            borderColor: colors.border,
                                        },
                                        pressed && styles.pressedButton,
                                    ]}
                                >
                                    <Feather
                                        name="edit-3"
                                        size={15}
                                        color={colors.primary}
                                    />
                                </Pressable>
                            </Tooltip>
                        )}
                        <Tooltip label={t("openOriginal")}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t("openOriginal")}
                                disabled={!canAccessOriginal}
                                onPress={handleOpenOriginal}
                                style={({ pressed }) => [
                                    styles.iconActionButton,
                                    {
                                        backgroundColor: colors.background,
                                        borderColor: colors.border,
                                    },
                                    !canAccessOriginal && styles.disabledAction,
                                    pressed && canAccessOriginal && styles.pressedButton,
                                ]}
                            >
                                <Feather
                                    name="external-link"
                                    size={15}
                                    color={colors.text}
                                />
                            </Pressable>
                        </Tooltip>

                        <Tooltip label={t("downloadOriginal")}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t("downloadOriginal")}
                                disabled={!canAccessOriginal}
                                onPress={handleDownloadOriginal}
                                style={({ pressed }) => [
                                    styles.iconActionButton,
                                    {
                                        backgroundColor: colors.background,
                                        borderColor: colors.border,
                                    },
                                    !canAccessOriginal && styles.disabledAction,
                                    pressed && canAccessOriginal && styles.pressedButton,
                                ]}
                            >
                                <Feather
                                    name="download"
                                    size={15}
                                    color={colors.text}
                                />
                            </Pressable>
                        </Tooltip>

                        <Tooltip label={t("previousFile")}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t("previousFile")}
                                disabled={!onPrevious}
                                onPress={onPrevious}
                                style={({ pressed }) => [
                                    styles.iconActionButton,
                                    {
                                        backgroundColor: colors.background,
                                        borderColor: colors.border,
                                    },
                                    !onPrevious && styles.disabledAction,
                                    pressed && Boolean(onPrevious) && styles.pressedButton,
                                ]}
                            >
                                <Feather
                                    name={previousIcon}
                                    size={16}
                                    color={colors.text}
                                />
                            </Pressable>
                        </Tooltip>

                        <Tooltip label={t("nextFile")}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t("nextFile")}
                                disabled={!onNext}
                                onPress={onNext}
                                style={({ pressed }) => [
                                    styles.iconActionButton,
                                    {
                                        backgroundColor: colors.background,
                                        borderColor: colors.border,
                                    },
                                    !onNext && styles.disabledAction,
                                    pressed && Boolean(onNext) && styles.pressedButton,
                                ]}
                            >
                                <Feather
                                    name={nextIcon}
                                    size={16}
                                    color={colors.text}
                                />
                            </Pressable>
                        </Tooltip>
                        

                    </View>
                </View>

                <View style={styles.compactMetaRow}>
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
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={direction === "rtl" ? "جزئیات بیشتر سند" : "More document details"}
                        onPress={() => openInformation("view")}
                        style={({ pressed }) => [
                            {
                                alignSelf: "center",
                                flexShrink: 0,
                                paddingHorizontal: spacing.sm,
                                paddingVertical: spacing.xs,
                                flexDirection: "row",
                                alignItems: "center",
                                gap: spacing.xs,
                                opacity: pressed ? 0.7 : 1,
                            },
                        ]}
                    >
                        <Feather name="info" size={14} color={colors.primary} />
                        <Text style={{ color: colors.primary, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, textDecorationLine: "underline" }}>
                            {direction === "rtl" ? "جزئیات بیشتر..." : "More Details..."}
                        </Text>
                    </Pressable>
                    </View>


            </View>

            <WorkspaceMetadataDialog item={item} visible={isInformationOpen} initialMode={informationMode} categoryDefinitions={categoryDefinitions} onUpdateItem={onUpdateItem} onClose={() => setIsInformationOpen(false)} />

            <View
                style={[
                    styles.previewShell,
                    isPhonePreview && styles.phonePreviewShell,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <WorkspacePreviewRenderer
                    item={item}
                    imageStyle={[
                        styles.imagePreview,
                        isPhonePreview && styles.phoneImagePreview,
                    ]}
                    pdfHeight={isPhonePreview ? 520 : 720}
                    borderColor={colors.border}
                    fallback={
                        <View
                            style={[
                                styles.placeholder,
                                isPhonePreview && styles.phonePlaceholder,
                                {
                                    backgroundColor: colors.background,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <Feather
                                name="file"
                                size={42}
                                color={colors.primary}
                            />

                            <Text
                                style={[
                                    styles.placeholderTitle,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                            >
                                {t("genericPreviewTitle")}
                            </Text>

                            <Text
                                style={[
                                    styles.placeholderDescription,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                            >
                                {t("genericPreviewDescription")}
                            </Text>
                        </View>
                    }
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 0,
        flexShrink: 0,
        minWidth: 0,
        minHeight: 0,
        overflowY: "visible",
    },

    content: {
        gap: spacing.sm,
        paddingBottom: spacing.xl,
    },

    topPanel: {
        width: "100%",
        paddingHorizontal: spacing.sm,
        paddingVertical: 7,
        borderWidth: 1,
        borderRadius: radius.lg,
        gap: spacing.sm,
        ...shadows.sm,
    },

    phoneTopPanel: {
        padding: spacing.sm,
    },

    topMainRow: {
        width: "100%",
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
    },

    phoneTopMainRow: {
        flexWrap: "wrap",
    },

    headerText: {
        flex: 1,
        minWidth: 0,
        paddingHorizontal: spacing.xs,
    },

    eyebrow: {
        marginBottom: 1,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    title: {
        width: "100%",
        minWidth: 0,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        textAlign: "right",
        whiteSpace: "normal",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
    },

    compactActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        flexShrink: 0,
        gap: spacing.xs,
    },

    compactButton: {
        minHeight: 34,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderWidth: 1,
        borderRadius: radius.md,
    },

    compactButtonText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
    },

    iconActionButton: {
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderRadius: radius.md,
    },

    compactMetaRow: {
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "stretch",
        gap: spacing.xs,
        paddingHorizontal: spacing.xs,
        paddingTop: 2,
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
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    statusValue: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
    },

    disabledAction: {
        opacity: 0.45,
    },

    pressedButton: {
        opacity: 0.82,
    },

    editPanel: {
        width: "100%",
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

    previewShell: {
        minHeight: 0,
        minWidth: 0,
        alignItems: "center",
        justifyContent: "flex-start",
        padding: spacing.md,
        borderWidth: 1,
        borderRadius: radius.lg,
        ...shadows.sm,
    },

    phonePreviewShell: {
        padding: spacing.sm,
    },

    imagePreview: {
        width: "100%",
        height: 500,
        maxHeight: 500,
    },

    phoneImagePreview: {
        height: 360,
        maxHeight: 360,
    },

    placeholder: {
        width: "100%",
        minHeight: 420,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        padding: spacing.lg,
        borderWidth: 1,
        borderRadius: radius.lg,
        borderStyle: "dashed",
    },

    phonePlaceholder: {
        minHeight: 300,
    },

    placeholderTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        textAlign: "center",
    },

    placeholderDescription: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "center",
        opacity: 0.72,
    },
});

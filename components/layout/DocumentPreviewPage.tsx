/**
 * ============================================================================
 * Document Preview Page
 * ----------------------------------------------------------------------------
 * Displays the standalone preview workspace for a selected document.
 * Keeps the preview area independent from the main workspace grid/list layout.
 * ============================================================================
 */

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
import WorkspacePreviewRenderer from "../preview/WorkspacePreviewRenderer";
import {
    getWorkspaceFileExtension,
    getWorkspaceItemStatusLabel,
    getWorkspaceItemUpdatedAtLabel,
} from "../workspace/workspace.helpers";

import type { WorkspaceItem } from "../workspace";

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface DocumentPreviewPageProps {
    item: WorkspaceItem;
    onBack: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function DocumentPreviewPage({
    item,
    onBack,
    onPrevious,
    onNext,
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

    const fileStatusLabel = getWorkspaceItemStatusLabel(item, direction, t);

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
                    <Pressable
                        title={t("backToWorkspace")}
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
                            dir="auto"
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

                    <View style={styles.compactActions}>
                        <Pressable
                            title={t("openOriginal")}
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
                                pressed &&
                                canAccessOriginal &&
                                styles.pressedButton,
                            ]}
                        >
                            <Feather
                                name="external-link"
                                size={15}
                                color={colors.text}
                            />
                        </Pressable>

                        <Pressable
                            title={t("downloadOriginal")}
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
                                pressed &&
                                canAccessOriginal &&
                                styles.pressedButton,
                            ]}
                        >
                            <Feather
                                name="download"
                                size={15}
                                color={colors.text}
                            />
                        </Pressable>

                        <Pressable
                            title={t("previousFile")}
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
                                pressed &&
                                Boolean(onPrevious) &&
                                styles.pressedButton,
                            ]}
                        >
                            <Feather
                                name={previousIcon}
                                size={16}
                                color={colors.text}
                            />
                        </Pressable>

                        <Pressable
                            title={t("nextFile")}
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
                                pressed &&
                                Boolean(onNext) &&
                                styles.pressedButton,
                            ]}
                        >
                            <Feather
                                name={nextIcon}
                                size={16}
                                color={colors.text}
                            />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.compactMetaRow}>
                    <Text
                        style={[
                            styles.compactMetaText,
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
                            styles.compactMetaSeparator,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        •
                    </Text>

                    <Text
                        style={[
                            styles.compactMetaText,
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
                            styles.compactMetaSeparator,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        •
                    </Text>

                    <Text
                        style={[
                            styles.compactMetaText,
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

/**
 * ============================================================================
 * Styles
 * ============================================================================
 */

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

        gap: 4,

        ...shadows.sm,
    },

    phoneTopPanel: {
        padding: spacing.sm,
    },

    topMainRow: {
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

        minWidth: 160,

        paddingHorizontal: spacing.xs,
    },

    eyebrow: {
        marginBottom: 1,

        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    title: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        textAlign: "right",
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
        flexDirection: "row",
        alignItems: "center",

        gap: 6,

        paddingHorizontal: spacing.xs,
        paddingTop: 2,
    },

    compactMetaText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,

        opacity: 0.78,
    },

    compactMetaSeparator: {
        fontSize: typography.fontSize.sm,

        opacity: 0.38,
    },

    disabledAction: {
        opacity: 0.45,
    },

    pressedButton: {
        opacity: 0.82,
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

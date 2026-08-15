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
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "../../web/ui";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import PdfPreviewRenderer from "../preview/PdfPreviewRenderer.web";

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
 * Helpers
 * ============================================================================
 */

function getNormalizedExtension(item: WorkspaceItem) {
    return item.extension?.replace(".", "").toLowerCase() ?? "";
}

function isImageFile(item: WorkspaceItem) {
    const extension = getNormalizedExtension(item);
    const mimeType = item.mimeType?.toLowerCase() ?? "";

    return (
        mimeType.startsWith("image/") ||
        ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)
    );
}

function isPdfFile(item: WorkspaceItem) {
    const extension = getNormalizedExtension(item);
    const mimeType = item.mimeType?.toLowerCase() ?? "";

    return extension === "pdf" || mimeType.includes("pdf");
}

function getFileTypeLabel(item: WorkspaceItem) {
    const extension = getNormalizedExtension(item);

    return extension ? extension.toUpperCase() : "فایل";
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
    const { theme } = useSettings();
    const { width } = useWindowDimensions();
    const colors = theme.colors;
    const isPhonePreview = width < 430;

    const shouldRenderImage = isImageFile(item) && Boolean(item.localUri);
    const shouldRenderPdf = isPdfFile(item) && Boolean(item.localUri);
    const canAccessOriginal = Boolean(item.localUri);

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
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator
            showsHorizontalScrollIndicator={false}
        >
            <View
                style={[
                    styles.header,
                    isPhonePreview && styles.phoneHeader,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="بازگشت به فضای کاری"
                    onPress={onBack}
                    style={({ pressed }) => [
                        styles.backButton,
                        isPhonePreview && styles.phoneBackButton,
                        {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                        },
                        pressed && styles.pressedBackButton,
                    ]}
                >
                    <Feather name="arrow-right" size={16} color={colors.surface} />

                    <Text
                        style={[
                            styles.backButtonText,
                            {
                                color: colors.surface,
                            },
                        ]}
                    >
                        بازگشت
                    </Text>
                </Pressable>

                <View style={styles.headerText}>
                    <Text
                        style={[
                            styles.eyebrow,
                            {
                                color: colors.primary,
                            },
                        ]}
                    >
                        پیش‌نمایش کامل
                    </Text>

                    <Text
                        numberOfLines={2}
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

            <View style={[styles.actionsPanel, isPhonePreview && styles.phoneActionsPanel]}>
                <View style={styles.actionGroup}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="باز کردن فایل اصلی"
                        disabled={!canAccessOriginal}
                        onPress={handleOpenOriginal}
                        style={({ pressed }) => [
                            styles.actionButton,
                            { backgroundColor: colors.primary, borderColor: colors.primary },
                            !canAccessOriginal && styles.disabledAction,
                            pressed && canAccessOriginal && styles.pressedBackButton,
                        ]}
                    >
                        <Feather name="external-link" size={16} color={colors.surface} />
                        <Text style={[styles.actionButtonText, { color: colors.surface }]}>باز کردن</Text>
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="دانلود فایل اصلی"
                        disabled={!canAccessOriginal}
                        onPress={handleDownloadOriginal}
                        style={({ pressed }) => [
                            styles.actionButton,
                            { backgroundColor: colors.background, borderColor: colors.border },
                            !canAccessOriginal && styles.disabledAction,
                            pressed && canAccessOriginal && styles.pressedBackButton,
                        ]}
                    >
                        <Feather name="download" size={16} color={colors.text} />
                        <Text style={[styles.actionButtonText, { color: colors.text }]}>دانلود</Text>
                    </Pressable>
                </View>

                <View style={styles.actionGroup}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="فایل قبلی"
                        disabled={!onPrevious}
                        onPress={onPrevious}
                        style={({ pressed }) => [
                            styles.actionButton,
                            { backgroundColor: colors.background, borderColor: colors.border },
                            !onPrevious && styles.disabledAction,
                            pressed && Boolean(onPrevious) && styles.pressedBackButton,
                        ]}
                    >
                        <Feather name="chevron-right" size={16} color={colors.text} />
                        <Text style={[styles.actionButtonText, { color: colors.text }]}>قبلی</Text>
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="فایل بعدی"
                        disabled={!onNext}
                        onPress={onNext}
                        style={({ pressed }) => [
                            styles.actionButton,
                            { backgroundColor: colors.background, borderColor: colors.border },
                            !onNext && styles.disabledAction,
                            pressed && Boolean(onNext) && styles.pressedBackButton,
                        ]}
                    >
                        <Text style={[styles.actionButtonText, { color: colors.text }]}>بعدی</Text>
                        <Feather name="chevron-left" size={16} color={colors.text} />
                    </Pressable>
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
                {shouldRenderImage ? (
                    <Image
                        source={{ uri: item.localUri }}
                        resizeMode="contain"
                        style={[
                            styles.imagePreview,
                            isPhonePreview && styles.phoneImagePreview,
                        ]}
                    />
                ) : shouldRenderPdf && item.localUri ? (
                    <PdfPreviewRenderer
                        uri={item.localUri}
                        title={item.name}
                        height={isPhonePreview ? 520 : 720}
                        backgroundColor={colors.background}
                        borderColor={colors.border}
                    />
                ) : (
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
                        <Feather name="file" size={42} color={colors.primary} />

                        <Text
                            style={[
                                styles.placeholderTitle,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            پیش‌نمایش کامل هنوز آماده نیست
                        </Text>

                        <Text
                            style={[
                                styles.placeholderDescription,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            برای این نوع فایل هنوز نمایشگر اختصاصی اضافه نشده است.
                        </Text>
                    </View>
                )}
            </View>

            <View
                style={[
                    styles.metaPanel,
                    isPhonePreview && styles.phoneMetaPanel,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View style={styles.metaItem}>
                    <Text style={[styles.metaLabel, { color: colors.text }]}>
                        نوع فایل
                    </Text>

                    <Text style={[styles.metaValue, { color: colors.text }]}>
                        {getFileTypeLabel(item)}
                    </Text>
                </View>

                <View style={styles.metaItem}>
                    <Text style={[styles.metaLabel, { color: colors.text }]}>
                        اندازه فایل
                    </Text>

                    <Text style={[styles.metaValue, { color: colors.text }]}>
                        {item.sizeLabel ?? "اندازه نامشخص"}
                    </Text>
                </View>
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
        flex: 1,
        minWidth: 0,
        minHeight: 0,
    },

    content: {
        gap: spacing.md,
        paddingBottom: spacing.xl,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,

        padding: spacing.md,

        borderWidth: 1,
        borderRadius: radius.lg,

        ...shadows.sm,
    },

    phoneHeader: {
        alignItems: "stretch",
        flexDirection: "column-reverse",
    },

    backButton: {
        minWidth: 88,
        height: 40,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,

        paddingHorizontal: spacing.md,

        borderWidth: 1,
        borderRadius: radius.md,

        ...shadows.sm,
    },

    phoneBackButton: {
        alignSelf: "flex-start",
    },

    pressedBackButton: {
        opacity: 0.82,
    },

    actionsPanel: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.sm,
        flexWrap: "wrap",
    },

    phoneActionsPanel: {
        alignItems: "stretch",
        flexDirection: "column",
    },

    actionGroup: {
        flexDirection: "row",
        gap: spacing.sm,
    },

    actionButton: {
        minWidth: 96,
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderRadius: radius.md,
    },

    actionButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    disabledAction: {
        opacity: 0.45,
    },

    backButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    headerText: {
        flex: 1,
        minWidth: 0,
    },

    eyebrow: {
        marginBottom: spacing.xs,

        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        textAlign: "right",
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

    metaPanel: {
        flexDirection: "row",
        gap: spacing.md,

        padding: spacing.md,

        borderWidth: 1,
        borderRadius: radius.lg,
    },

    phoneMetaPanel: {
        flexDirection: "column",
    },

    metaItem: {
        flex: 1,
        minWidth: 0,
        gap: spacing.xs,
    },

    metaLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
        opacity: 0.64,
    },

    metaValue: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },
});

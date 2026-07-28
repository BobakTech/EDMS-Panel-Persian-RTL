/**
 * ============================================================================
 * Document Preview Page
 * ----------------------------------------------------------------------------
 * Shows a larger preview layout for the selected workspace file.
 * ============================================================================
 */

import { Feather } from "@expo/vector-icons";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

import type { WorkspaceItem } from "../workspace";

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface DocumentPreviewPageProps {
    item: WorkspaceItem;
    onBack: () => void;
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
}: DocumentPreviewPageProps) {
    const { theme } = useSettings();
    const colors = theme.colors;

    const shouldRenderImage = isImageFile(item) && Boolean(item.localUri);

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
                    style={[
                        styles.backButton,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Feather name="arrow-right" size={16} color={colors.text} />

                    <Text
                        style={[
                            styles.backButtonText,
                            {
                                color: colors.text,
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

            <View
                style={[
                    styles.previewShell,
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
                        style={styles.imagePreview}
                    />
                ) : (
                    <View
                        style={[
                            styles.placeholder,
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
                            برای این نوع فایل، renderer کامل در مرحله بعد اضافه می‌شود.
                        </Text>
                    </View>
                )}
            </View>

            <View
                style={[
                    styles.metaPanel,
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

    backButton: {
        minHeight: 38,

        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,

        paddingHorizontal: spacing.md,

        borderWidth: 1,
        borderRadius: radius.md,
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
        minHeight: 560,

        alignItems: "center",
        justifyContent: "center",

        padding: spacing.md,

        borderWidth: 1,
        borderRadius: radius.lg,

        ...shadows.sm,
    },

    imagePreview: {
        width: "100%",
        height: 620,
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
        flexDirection: "row-reverse",
        gap: spacing.md,

        padding: spacing.md,

        borderWidth: 1,
        borderRadius: radius.lg,
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

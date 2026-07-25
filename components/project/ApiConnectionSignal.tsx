/**
 * ============================================================================
 * API Connection Signal
 * ----------------------------------------------------------------------------
 * Shows a compact backend/API connection indicator with a details pop-up.
 * ============================================================================
 */

import { Feather } from "@expo/vector-icons";
import { useState } from "react";

import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface ApiConnectionSignalProps {
    isLoading: boolean;
    isConnected: boolean;
    errorMessage?: string | null;
}

/**
 * ============================================================================
 * Status Helpers
 * ============================================================================
 */

function getStatusLabel(isLoading: boolean, isConnected: boolean) {
    if (isLoading) {
        return "در حال بررسی اتصال";
    }

    if (isConnected) {
        return "اتصال برقرار است";
    }

    return "اتصال برقرار نیست";
}

function getStatusColor(isLoading: boolean, isConnected: boolean) {
    if (isLoading) {
        return "#F59E0B";
    }

    if (isConnected) {
        return "#22C55E";
    }

    return "#9CA3AF";
}

function getStatusIcon(isLoading: boolean, isConnected: boolean) {
    if (isLoading) {
        return "activity";
    }

    if (isConnected) {
        return "wifi";
    }

    return "wifi-off";
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function ApiConnectionSignal({
    isLoading,
    isConnected,
    errorMessage,
}: ApiConnectionSignalProps) {
    const { theme } = useSettings();
    const colors = theme.colors;

    const [isOpen, setIsOpen] = useState(false);

    const statusLabel = getStatusLabel(isLoading, isConnected);
    const statusColor = getStatusColor(isLoading, isConnected);
    const statusIcon = getStatusIcon(isLoading, isConnected);

    return (
        <>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="نمایش وضعیت اتصال به سرور"
                onPress={() => setIsOpen(true)}
                style={({ pressed }) => [
                    styles.signalButton,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                    pressed && styles.pressedButton,
                ]}
            >
                <View
                    style={[
                        styles.signalDot,
                        {
                            backgroundColor: statusColor,
                        },
                    ]}
                />

                <Feather
                    name={statusIcon}
                    size={18}
                    color={statusColor}
                />

                <Text
                    style={[
                        styles.signalText,
                        {
                            color: colors.text,
                        },
                    ]}
                    numberOfLines={1}
                >
                    وضعیت اتصال
                </Text>
            </Pressable>

            <Modal
                transparent
                visible={isOpen}
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <View style={styles.modalRoot}>
                    <Pressable
                        style={styles.backdrop}
                        onPress={() => setIsOpen(false)}
                    />

                    <View
                        style={[
                            styles.popover,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <View style={styles.popoverHeader}>
                            <View
                                style={[
                                    styles.largeSignal,
                                    {
                                        backgroundColor: `${statusColor}1A`,
                                        borderColor: statusColor,
                                    },
                                ]}
                            >
                                <Feather
                                    name={statusIcon}
                                    size={22}
                                    color={statusColor}
                                />
                            </View>

                            <View style={styles.popoverTitleArea}>
                                <Text
                                    style={[
                                        styles.popoverTitle,
                                        {
                                            color: colors.text,
                                        },
                                    ]}
                                >
                                    وضعیت اتصال به سرور
                                </Text>

                                <Text
                                    style={[
                                        styles.popoverStatus,
                                        {
                                            color: statusColor,
                                        },
                                    ]}
                                >
                                    {statusLabel}
                                </Text>
                            </View>
                        </View>

                        <Text
                            style={[
                                styles.popoverDescription,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            این تست فقط بررسی می‌کند که پنل بتواند از مسیر API تنظیم‌شده پاسخ دریافت کند. هیچ منطق بک‌اندی در فرانت‌اند ساخته نشده است.
                        </Text>

                        {!isLoading && !isConnected && (
                            <Text
                                style={[
                                    styles.errorText,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                            >
                                {errorMessage ?? "پاسخی از سرور دریافت نشد."}
                            </Text>
                        )}

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="بستن وضعیت اتصال"
                            onPress={() => setIsOpen(false)}
                            style={[
                                styles.closeButton,
                                {
                                    backgroundColor: colors.background,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.closeButtonText,
                                    {
                                        color: colors.text,
                                    },
                                ]}
                            >
                                بستن
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </>
    );
}

/**
 * ============================================================================
 * Styles
 * ============================================================================
 */

const styles = StyleSheet.create({
    signalButton: {
        width: "100%",

        flexDirection: "row-reverse",
        alignItems: "center",

        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,

        borderWidth: 1,
        borderRadius: radius.md,

        gap: spacing.sm,
    },

    pressedButton: {
        opacity: 0.82,
    },

    signalDot: {
        width: 8,
        height: 8,

        borderRadius: radius.pill,
    },

    signalText: {
        flex: 1,
        minWidth: 0,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    modalRoot: {
        flex: 1,

        alignItems: "center",
        justifyContent: "center",

        padding: spacing.lg,
    },

    backdrop: {
        /**
         * Full-screen modal backdrop fill.
         */
        ...StyleSheet.absoluteFill,

        backgroundColor: "rgba(0,0,0,0.36)",
    },

    popover: {
        zIndex: 1,

        width: "100%",
        maxWidth: 360,

        padding: spacing.lg,

        borderWidth: 1,
        borderRadius: radius.xl,

        gap: spacing.md,

        ...shadows.lg,
    },

    popoverHeader: {
        flexDirection: "row-reverse",
        alignItems: "center",

        gap: spacing.md,
    },

    largeSignal: {
        width: 44,
        height: 44,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.lg,
    },

    popoverTitleArea: {
        flex: 1,
        minWidth: 0,

        alignItems: "flex-end",
    },

    popoverTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        textAlign: "right",
    },

    popoverStatus: {
        marginTop: spacing.xs,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    popoverDescription: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        lineHeight: 22,
        textAlign: "right",

        opacity: 0.72,
    },

    errorText: {
        padding: spacing.md,

        borderRadius: radius.lg,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        lineHeight: 22,
        textAlign: "right",

        opacity: 0.72,
    },

    closeButton: {
        alignItems: "center",
        justifyContent: "center",

        paddingVertical: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.md,
    },

    closeButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },
});

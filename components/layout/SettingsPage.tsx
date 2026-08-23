/**
 * ============================================================================
 * Settings Page
 * ----------------------------------------------------------------------------
 * Displays frontend-only panel settings such as appearance and language.
 * ============================================================================
 */

import { useEffect } from "react";
import { Feather } from "../../web/icons";
import { Modal, Pressable, StyleSheet, Text, View } from "../../web/ui";

import { radius, semanticColors, shadows, spacing, typography } from "../../theme";
import { useSettings, type ThemeMode } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";

import type { Language, TranslationKey } from "../../locales";

/**
 * ============================================================================
 * Setting Choices
 * ============================================================================
 */

const themeChoices: Array<{
    labelKey: TranslationKey;
    value: ThemeMode;
}> = [
    {
        labelKey: "dark",
        value: "dark",
    },
    {
        labelKey: "light",
        value: "light",
    },
];

const languageChoices: Array<{
    labelKey: TranslationKey;
    value: Language;
}> = [
    {
        labelKey: "persian",
        value: "fa",
    },
    {
        labelKey: "english",
        value: "en",
    },
];

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

interface SettingsPageProps {
    onClose: () => void;
}

export default function SettingsPage({ onClose }: SettingsPageProps) {
    const {
        theme,
        themeMode,
        language,
        direction,
        setThemeMode,
        setLanguage,
        t,
    } = useSettings();

    const colors = theme.colors;
    const { isRtl, textAlign } = getDirectionalLayout(direction);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <Modal
            transparent
            visible
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("closeSettings")}
                    onPress={onClose}
                    style={styles.backdrop}
                />

            <View
                style={[
                    styles.content,
                    {
                        direction,
                    },
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View style={styles.header}>
                    <View style={[
                        styles.headerTitleRow,
                        !isRtl && styles.ltrHeaderTitleRow,
                    ]}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t("closeSettings")}
                            onPress={onClose}
                            style={[
                                styles.closeButton,
                                {
                                    backgroundColor: colors.background,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <Feather name="x" size={17} color={colors.text} />
                        </Pressable>

                        <Text
                            style={[
                                styles.title,
                                {
                                    color: colors.text,
                                    textAlign,
                                },
                            ]}
                        >
                            {t("settings")}
                        </Text>
                    </View>

                    <Text
                        style={[
                            styles.subtitle,
                            {
                                color: colors.text,
                                textAlign,
                            },
                        ]}
                    >
                        {t("settingsDescription")}
                    </Text>
                </View>

                <View style={[styles.settingsSection, !isRtl && styles.ltrSection]}>
                    <View style={[styles.settingsSectionHeader, !isRtl && styles.ltrSection]}>
                        <Text
                            style={[
                                styles.settingsSectionTitle,
                                {
                                    color: colors.text,
                                    textAlign,
                                },
                            ]}
                        >
                            {t("appearance")}
                        </Text>

                        <Text
                            style={[
                                styles.settingsSectionDescription,
                                {
                                    color: colors.text,
                                    textAlign,
                                },
                            ]}
                        >
                            {t("appearanceDescription")}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.segmentedControl,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        {themeChoices.map((choice) => {
                            const isSelected = choice.value === themeMode;

                            return (
                                <Pressable
                                    key={choice.value}
                                    accessibilityRole="button"
                                    accessibilityLabel={t(choice.labelKey)}
                                    onPress={() => setThemeMode(choice.value)}
                                    style={({ pressed }) => [
                                        styles.segmentedButton,
                                        isSelected && {
                                            backgroundColor: colors.primary,
                                        },
                                        pressed && styles.pressedSegmentedButton,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.segmentedButtonText,
                                            {
                                                color: isSelected
                                                    ? colors.background
                                                    : colors.text,
                                            },
                                        ]}
                                    >
                                        {t(choice.labelKey)}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View style={[styles.settingsSection, !isRtl && styles.ltrSection]}>
                    <View style={[styles.settingsSectionHeader, !isRtl && styles.ltrSection]}>
                        <Text
                            style={[
                                styles.settingsSectionTitle,
                                {
                                    color: colors.text,
                                    textAlign,
                                },
                            ]}
                        >
                            {t("language")}
                        </Text>

                        <Text
                            style={[
                                styles.settingsSectionDescription,
                                {
                                    color: colors.text,
                                    textAlign,
                                },
                            ]}
                        >
                            {t("languageDescription")}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.segmentedControl,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        {languageChoices.map((choice) => {
                            const isSelected = choice.value === language;

                            return (
                                <Pressable
                                    key={choice.value}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${t("selectLanguage")} ${t(choice.labelKey)}`}
                                    onPress={() => setLanguage(choice.value)}
                                    style={({ pressed }) => [
                                        styles.segmentedButton,
                                        isSelected && {
                                            backgroundColor: colors.primary,
                                        },
                                        pressed && styles.pressedSegmentedButton,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.segmentedButtonText,
                                            {
                                                color: isSelected
                                                    ? colors.background
                                                    : colors.text,
                                            },
                                        ]}
                                    >
                                        {t(choice.labelKey)}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View
                    style={[
                        styles.statusNote,
                        {
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.statusNoteTitle,
                            {
                                color: colors.text,
                                textAlign,
                            },
                        ]}
                    >
                        {t("currentStatus")}
                    </Text>

                    <Text
                        style={[
                            styles.statusNoteDescription,
                            {
                                color: colors.text,
                                textAlign,
                            },
                        ]}
                    >
                        {t("temporarySettingsNotice")}
                    </Text>
                </View>
            </View>
            </View>
        </Modal>
    );
}

/**
 * ============================================================================
 * Styles
 * ============================================================================
 */

const styles = StyleSheet.create({
    overlay: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,

        width: "100vw",
        height: "100vh",

        alignItems: "center",
        justifyContent: "center",

        padding: spacing.lg,
    },

    backdrop: {
        ...StyleSheet.absoluteFill,

        backgroundColor: semanticColors.backdropStrong,
    },

    content: {
        zIndex: 1,

        width: "100%",
        maxWidth: 520,

        direction: "rtl",

        gap: spacing.lg,

        padding: spacing.lg,

        borderWidth: 1,
        borderRadius: radius.xl,

        ...shadows.sm,
    },

    header: {
        alignItems: "flex-start",
        gap: spacing.sm,
    },

    headerTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",

        gap: spacing.md,
    },

    ltrHeaderTitleRow: {
        width: "100%",
        flexDirection: "row-reverse",
        justifyContent: "space-between",
    },

    closeButton: {
        width: 34,
        height: 34,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.md,
    },

    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        textAlign: "right",
    },

    subtitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",
    },

    settingsSection: {
        alignItems: "flex-start",

        gap: spacing.sm,
    },

    settingsSectionHeader: {
        alignItems: "flex-start",

        gap: spacing.xs,
    },

    ltrSection: {
        alignItems: "stretch",
    },

    settingsSectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    settingsSectionDescription: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",
    },

    segmentedControl: {
        flexDirection: "row",
        alignSelf: "flex-start",

        overflow: "hidden",

        borderWidth: 1,
        borderRadius: radius.md,
    },

    segmentedButton: {
        minWidth: 84,

        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },

    pressedSegmentedButton: {
        opacity: 0.78,
    },

    segmentedButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "center",
    },

    statusNote: {
        alignSelf: "stretch",

        gap: spacing.sm,

        padding: spacing.md,

        borderWidth: 1,
        borderRadius: radius.lg,
    },

    statusNoteTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    statusNoteDescription: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",
    },
});

/**
 * ============================================================================
 * Settings Page
 * ----------------------------------------------------------------------------
 * Displays panel settings such as appearance and language.
 * ============================================================================
 */

import { useEffect, useRef, useState } from "react";
import { Feather } from "../../web/icons";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "../../web/ui";

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
        hasDefaultChanges,
        resetSettings,
        saveSettingsAsDefault,
        t,
    } = useSettings();

    const colors = theme.colors;
    const { isRtl, textAlign } = getDirectionalLayout(direction);
    const { width } = useWindowDimensions();
    const isCompact = width < 680;

    const [showDefaultConfirmation, setShowDefaultConfirmation] = useState(false);
    const [saveResult, setSaveResult] = useState<"success" | "error" | null>(null);
    const saveResultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSaveAsDefault = () => {
        if (!hasDefaultChanges) return;

        const succeeded = saveSettingsAsDefault();
        setSaveResult(succeeded ? "success" : "error");

        if (saveResultTimer.current) clearTimeout(saveResultTimer.current);

        saveResultTimer.current = setTimeout(() => {
            setSaveResult(null);
            saveResultTimer.current = null;
        }, 3000);
    };

    const handleConfirmDefault = () => {
        const succeeded = resetSettings();

        setShowDefaultConfirmation(false);
        setSaveResult(succeeded ? "success" : "error");

        if (saveResultTimer.current) clearTimeout(saveResultTimer.current);

        saveResultTimer.current = setTimeout(() => {
            setSaveResult(null);
            saveResultTimer.current = null;
        }, 3000);
    };

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                if (showDefaultConfirmation) {
                    setShowDefaultConfirmation(false);
                    return;
                }

                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose, showDefaultConfirmation]);

    useEffect(() => {
        return () => {
            if (saveResultTimer.current) clearTimeout(saveResultTimer.current);
        };
    }, []);

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
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View
                            style={[
                                styles.headerTitleRow,
                                !isRtl && styles.ltrHeaderTitleRow,
                            ]}
                        >
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

                    {/* Appearance */}
                    <View
                        style={[
                            styles.settingsSection,
                            isCompact && styles.compactSection,
                        ]}
                    >
                        <View
                            style={[
                                styles.settingsSectionHeader,
                                !isRtl && styles.ltrSection,
                            ]}
                        >
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

                    <View
                        style={[
                            styles.sectionDivider,
                            {
                                backgroundColor: colors.border,
                            },
                        ]}
                    />

                    {/* Language */}
                    <View
                        style={[
                            styles.settingsSection,
                            isCompact && styles.compactSection,
                        ]}
                    >
                        <View
                            style={[
                                styles.settingsSectionHeader,
                                !isRtl && styles.ltrSection,
                            ]}
                        >
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
                            styles.sectionDivider,
                            {
                                backgroundColor: colors.border,
                            },
                        ]}
                    />

                    {/* Current status and default actions */}
                    <View
                        style={[
                            styles.statusNote,
                            isCompact && styles.compactStatusNote,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.statusContent,
                                !isRtl && styles.ltrSection,
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

                        <View style={styles.defaultArea}>
                            <View style={styles.defaultGroup}>
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel={t("resetToDefaultSettings")}
                                    onPress={() => setShowDefaultConfirmation(true)}
                                    style={({ pressed }) => [
                                        styles.defaultButton,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.text,
                                        },
                                        pressed && styles.defaultButtonPressed,
                                    ]}
                                >
                                    <Feather
                                        name="rotate-ccw"
                                        size={16}
                                        color={colors.text}
                                    />

                                    <Text
                                        style={[
                                            styles.defaultButtonText,
                                            {
                                                color: colors.text,
                                            },
                                        ]}
                                    >
                                        {t("defaultSettings")}
                                    </Text>
                                </Pressable>

                                {showDefaultConfirmation && (
                                    <View
                                        style={[
                                            styles.defaultConfirmation,
                                            {
                                                backgroundColor: colors.surface,
                                                borderColor: colors.border,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.defaultConfirmationText,
                                                {
                                                    color: colors.text,
                                                    textAlign,
                                                },
                                            ]}
                                        >
                                            {t("confirmRestoreDefaultSettings")}
                                        </Text>

                                        <View style={styles.confirmationActions}>
                                            <Pressable
                                                accessibilityRole="button"
                                                onPress={() => setShowDefaultConfirmation(false)}
                                                style={({ pressed }) => [
                                                    styles.confirmationButton,
                                                    {
                                                        backgroundColor: colors.background,
                                                        borderColor: colors.border,
                                                    },
                                                    pressed && styles.defaultButtonPressed,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.defaultButtonText,
                                                        {
                                                            color: colors.text,
                                                        },
                                                    ]}
                                                >
                                                    {t("cancel")}
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                accessibilityRole="button"
                                                onPress={handleConfirmDefault}
                                                style={({ pressed }) => [
                                                    styles.confirmationButton,
                                                    {
                                                        backgroundColor: colors.primary,
                                                        borderColor: colors.primary,
                                                    },
                                                    pressed && styles.defaultButtonPressed,
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.defaultButtonText,
                                                        {
                                                            color: colors.background,
                                                        },
                                                    ]}
                                                >
                                                    {t("restoreDefaultSettings")}
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                )}
                            </View>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t("saveAsDefaultSettings")}
                                disabled={!hasDefaultChanges}
                                onPress={handleSaveAsDefault}
                                style={({ pressed }) => [
                                    styles.defaultButton,
                                    styles.saveDefaultButton,
                                    {
                                        backgroundColor:
                                            saveResult === "success"
                                                ? "#16a34a"
                                                : saveResult === "error"
                                                    ? "#dc2626"
                                                    : colors.primary,
                                        borderColor:
                                            saveResult === "success"
                                                ? "#16a34a"
                                                : saveResult === "error"
                                                    ? "#dc2626"
                                                    : colors.primary,
                                    },
                                    !hasDefaultChanges &&
                                    saveResult === null &&
                                    styles.disabledButton,
                                    pressed &&
                                    hasDefaultChanges &&
                                    styles.defaultButtonPressed,
                                ]}
                            >
                                <Feather
                                    name={saveResult === "error" ? "x" : "check"}
                                    size={16}
                                    color={colors.background}
                                />

                                <Text
                                    style={[
                                        styles.defaultButtonText,
                                        {
                                            color: colors.background,
                                        },
                                    ]}
                                >
                                    {saveResult === "success"
                                        ? t("defaultSaved")
                                        : saveResult === "error"
                                            ? t("defaultSaveFailed")
                                            : t("saveAsDefault")}
                                </Text>
                            </Pressable>
                        </View>
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
        maxWidth: 760,
        direction: "rtl",
        gap: spacing.md,
        padding: spacing.lg,
        borderWidth: 1,
        borderRadius: radius.xl,
        ...shadows.sm,
    },

    header: {
        alignItems: "flex-start",
        gap: spacing.xs,
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
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.lg,
        paddingVertical: spacing.sm,
    },

    compactSection: {
        flexDirection: "column",
        alignItems: "stretch",
        gap: spacing.sm,
    },

    settingsSectionHeader: {
        flex: 1,
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

    sectionDivider: {
        width: "100%",
        height: 1,
        opacity: 0.7,
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.md,
        padding: spacing.md,
        borderWidth: 1,
        borderRadius: radius.lg,
    },

    compactStatusNote: {
        flexDirection: "column",
        alignItems: "stretch",
    },

    statusContent: {
        flex: 1,
        alignItems: "flex-start",
        gap: spacing.xs,
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

    defaultArea: {
        minWidth: 190,
        alignItems: "stretch",
        gap: spacing.sm,
    },

    defaultGroup: {
        alignItems: "stretch",
        gap: spacing.sm,
    },

    defaultButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderRadius: radius.md,
        opacity: 0.82,
    },

    saveDefaultButton: {
        opacity: 1,
    },

    disabledButton: {
        opacity: 0.35,
        cursor: "not-allowed",
    },

    defaultButtonPressed: {
        opacity: 0.58,
    },

    defaultButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    defaultConfirmation: {
        gap: spacing.sm,
        padding: spacing.sm,
        borderWidth: 1,
        borderRadius: radius.md,
    },

    defaultConfirmationText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
    },

    confirmationActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: spacing.sm,
    },

    confirmationButton: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderRadius: radius.md,
    },
});
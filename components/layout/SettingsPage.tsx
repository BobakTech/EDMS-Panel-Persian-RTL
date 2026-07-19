/**
 * ============================================================================
 * Settings Page
 * ----------------------------------------------------------------------------
 * Displays frontend-only panel settings such as appearance and language.
 * ============================================================================
 */

import { Pressable, StyleSheet, Text, View } from "react-native";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings, type ThemeMode } from "../../settings/SettingsContext";

import type { Language } from "../../locales";

/**
 * ============================================================================
 * Setting Choices
 * ============================================================================
 */

const themeChoices: Array<{
    label: string;
    value: ThemeMode;
}> = [
    {
        label: "تیره",
        value: "dark",
    },
    {
        label: "روشن",
        value: "light",
    },
];

const languageChoices: Array<{
    label: string;
    value: Language;
}> = [
    {
        label: "فارسی",
        value: "fa",
    },
    {
        label: "English",
        value: "en",
    },
];

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function SettingsPage() {
    const {
        theme,
        themeMode,
        language,
        setThemeMode,
        setLanguage,
    } = useSettings();

    const colors = theme.colors;

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                },
            ]}
        >
            <View
                style={[
                    styles.content,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View style={styles.header}>
                    <Text
                        style={[
                            styles.title,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        تنظیمات
                    </Text>

                    <Text
                        style={[
                            styles.subtitle,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        مدیریت تنظیمات نمایشی و ترجیحات پنل
                    </Text>
                </View>

                <View style={styles.settingsSection}>
                    <View style={styles.settingsSectionHeader}>
                        <Text
                            style={[
                                styles.settingsSectionTitle,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            ظاهر پنل
                        </Text>

                        <Text
                            style={[
                                styles.settingsSectionDescription,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            حالت نمایش پنل را انتخاب کنید.
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
                                    accessibilityLabel={`انتخاب حالت ${choice.label}`}
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
                                        {choice.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.settingsSection}>
                    <View style={styles.settingsSectionHeader}>
                        <Text
                            style={[
                                styles.settingsSectionTitle,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            زبان
                        </Text>

                        <Text
                            style={[
                                styles.settingsSectionDescription,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            زبان نمایش برچسب‌های اصلی پنل را انتخاب کنید.
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
                                    accessibilityLabel={`انتخاب زبان ${choice.label}`}
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
                                        {choice.label}
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
                            },
                        ]}
                    >
                        وضعیت فعلی
                    </Text>

                    <Text
                        style={[
                            styles.statusNoteDescription,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        تنظیمات در این نسخه به‌صورت فرانت‌اندی و موقت اعمال می‌شوند.
                        ذخیره‌سازی دائمی و اتصال به پنل اصلی بعداً اضافه می‌شود.
                    </Text>
                </View>
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
        flex: 1,

        padding: spacing.xl,
    },

    content: {
        flex: 1,

        gap: spacing.xl,

        padding: spacing.xl,

        borderWidth: 1,
        borderRadius: radius.xl,

        ...shadows.sm,
    },

    header: {
        alignItems: "flex-end",

        gap: spacing.sm,
    },

    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
        textAlign: "right",
    },

    subtitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",
    },

    settingsSection: {
        alignItems: "flex-end",

        gap: spacing.md,
    },

    settingsSectionHeader: {
        alignItems: "flex-end",

        gap: spacing.xs,
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
        flexDirection: "row-reverse",
        alignSelf: "flex-end",

        overflow: "hidden",

        borderWidth: 1,
        borderRadius: radius.md,
    },

    segmentedButton: {
        minWidth: 92,

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

        padding: spacing.lg,

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

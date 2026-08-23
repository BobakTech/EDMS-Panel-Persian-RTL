import { Feather } from "../../web/icons";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "../../web/ui";
import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";

interface ToolbarSearchFieldProps {
    value: string;
    mobile?: boolean;
    onChange: (value: string) => void;
}

export function ToolbarSearchField({
    value,
    mobile = false,
    onChange,
}: ToolbarSearchFieldProps) {
    const { direction, t, theme } = useSettings();
    const colors = theme.colors;
    const { textAlign } = getDirectionalLayout(direction);

    return (
        <View
            style={[
                styles.searchField,
                mobile && styles.mobileSearchInput,
                {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    direction,
                },
            ]}
        >
            {value.length > 0 && (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("clearSearch")}
                    onPress={() => onChange("")}
                    style={({ pressed }) => [
                        styles.clearSearchButton,
                        pressed && styles.pressedActionButton,
                    ]}
                >
                    <Feather name="x" size={17} color={colors.text} />
                </Pressable>
            )}

            <TextInput
                value={value}
                onChangeText={onChange}
                placeholder={t("search")}
                placeholderTextColor={colors.border}
                style={[
                    styles.searchInput,
                    { color: colors.text, textAlign },
                ]}
            />
        </View>
    );
}

interface ToolbarUploadProgressProps {
    variant: "desktop" | "mobile";
    progress: number | null;
    fileName: string | null;
    statusText: string;
}

export function ToolbarUploadProgress({
    variant,
    progress,
    fileName,
    statusText,
}: ToolbarUploadProgressProps) {
    const { direction, t, theme } = useSettings();
    const colors = theme.colors;
    const { textAlign } = getDirectionalLayout(direction);
    const isVisible = progress !== null;

    const panel = (
        <View
            style={[
                variant === "desktop" ? styles.uploadPanel : styles.mobileUploadPanel,
                {
                    backgroundColor:
                        variant === "desktop"
                            ? colors.surface
                            : colors.background,
                    borderColor: colors.primary,
                    direction,
                },
            ]}
        >
            <Text
                style={[
                    styles.uploadPanelTitle,
                    { color: colors.text, textAlign },
                ]}
                numberOfLines={1}
            >
                {fileName ?? t("selectedFile")}
            </Text>

            <Text
                style={[
                    styles.uploadPanelDescription,
                    { color: colors.border, textAlign },
                ]}
            >
                {statusText}
            </Text>

            <View
                style={[
                    styles.uploadProgressTrack,
                    {
                        backgroundColor:
                            variant === "desktop"
                                ? colors.background
                                : colors.surface,
                    },
                ]}
            >
                <View
                    style={[
                        styles.uploadProgressFill,
                        {
                            width: `${progress ?? 0}%`,
                            backgroundColor: colors.primary,
                        },
                    ]}
                />
            </View>
        </View>
    );

    if (variant === "mobile") {
        return isVisible ? panel : null;
    }

    return (
        <Modal transparent visible={isVisible} animationType="fade">
            <View style={styles.uploadOverlay}>{panel}</View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    pressedActionButton: {
        opacity: 0.82,
    },
    searchField: {
        flex: 1,
        minHeight: 40,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: radius.md,
    },
    searchInput: {
        flex: 1,
        minWidth: 0,
        backgroundColor: "transparent",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.regular,
    },
    clearSearchButton: {
        width: 38,
        alignSelf: "stretch",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    },
    mobileSearchInput: {
        width: "100%",
        flex: 0,
    },
    uploadPanel: {
        width: 360,
        maxWidth: "86%",
        padding: spacing.md,
        borderWidth: 1,
        borderRadius: radius.lg,
        ...shadows.md,
    },
    mobileUploadPanel: {
        width: "100%",
        padding: spacing.md,
        borderWidth: 1,
        borderRadius: radius.lg,
    },
    uploadPanelTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },
    uploadOverlay: {
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        alignItems: "center",
        paddingTop: 92,
        pointerEvents: "box-none",
    },
    uploadPanelDescription: {
        marginTop: spacing.xs,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        textAlign: "right",
    },
    uploadProgressTrack: {
        height: 6,
        marginTop: spacing.sm,
        borderRadius: radius.pill,
        overflow: "hidden",
    },
    uploadProgressFill: {
        height: "100%",
        borderRadius: radius.pill,
    },
});

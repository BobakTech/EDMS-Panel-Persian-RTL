/**
 * ============================================================================
 * Workspace Item Details Panel
 * ----------------------------------------------------------------------------
 * Displays metadata for the selected workspace item.
 * Operational item actions are handled by the workspace selection toolbar.
 * ============================================================================
 */

import { Feather } from "../../web/icons";
import { Pressable, StyleSheet, Text, View } from "../../web/ui";

import { radius, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";

import {
    getWorkspaceItemLabel,
    getWorkspaceItemStatusLabel,
    getWorkspaceItemUpdatedAtLabel,
} from "./workspace.helpers";

import type { WorkspaceItem } from "./workspace.types";

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface WorkspaceItemDetailsPanelProps {
    item: WorkspaceItem;
    onClose: () => void;
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function WorkspaceItemDetailsPanel({
    item,
    onClose,
}: WorkspaceItemDetailsPanelProps) {
    const { direction, language, t, theme } = useSettings();
    const colors = theme.colors;
    const { textAlign } = getDirectionalLayout(direction);

    return (
        <View
            className="workspace-motion-panel"
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    direction,
                },
            ]}
        >
            <View style={styles.content}>
                <Text
                    style={[
                        styles.label,
                        {
                            color: colors.primary,
                            textAlign,
                        },
                    ]}
                >
                    {getWorkspaceItemLabel(item, t)}
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

                <View style={styles.metaRow}>
                    <Text
                        style={[
                            styles.metaText,
                            {
                                color: colors.text,
                                textAlign,
                            },
                        ]}
                    >
                        {t("status")}: {getWorkspaceItemStatusLabel(item, direction, t)}
                    </Text>

                    <Text
                        style={[
                            styles.metaText,
                            {
                                color: colors.text,
                                textAlign,
                            },
                        ]}
                    >
                        {getWorkspaceItemUpdatedAtLabel(item, t, language)}
                    </Text>
                </View>
            </View>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("closeDetails")}
                onPress={onClose}
                style={({ pressed }) => [
                    styles.closeButton,
                    {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                    },
                    pressed && styles.pressedCloseButton,
                ]}
            >
                <Feather name="x" size={16} color={colors.text} />
            </Pressable>
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
        position: "relative",

        flexDirection: "row",
        alignItems: "center",

        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.lg,

        animation:
            "edms-workspace-panel-in 160ms cubic-bezier(0.2, 0.8, 0.2, 1)",
    },

    content: {
        flex: 1,
        minWidth: 0,
    },

    label: {
        marginBottom: spacing.xs,

        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "start",
    },

    title: {
        marginBottom: spacing.xs,

        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "start",
    },

    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",

        gap: spacing.md,
    },

    metaText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,

        opacity: 0.64,
    },

    closeButton: {
        width: 34,
        height: 34,

        flexShrink: 0,

        alignItems: "center",
        justifyContent: "center",

        marginInlineStart: spacing.md,

        borderWidth: 1,
        borderRadius: radius.pill,

        transition: "transform 140ms ease, opacity 140ms ease",
    },

    pressedCloseButton: {
        opacity: 0.78,
        transform: "scale(0.96)",
    },
});

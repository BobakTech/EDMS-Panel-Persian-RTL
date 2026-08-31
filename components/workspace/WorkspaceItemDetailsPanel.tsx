/**
 * ============================================================================
 * Workspace Item Details Panel
 * ----------------------------------------------------------------------------
 * Displays metadata and actions for the selected workspace item.
 * ============================================================================
 */

import { StyleSheet, Text, View } from "../../web/ui";

import { radius, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";

import {
    getWorkspaceItemDescription,
    getWorkspaceItemLabel,
    getWorkspaceItemStatusLabel,
    getWorkspaceItemUpdatedAtLabel,
} from "./workspace.helpers";
import WorkspaceItemDetailsActions, {
    type WorkspaceItemDetailsAction,
} from "./WorkspaceItemDetailsActions";

import type { WorkspaceItem } from "./workspace.types";

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface WorkspaceItemDetailsPanelProps {
    item: WorkspaceItem;
    primaryAction: WorkspaceItemDetailsAction;
    secondaryAction?: WorkspaceItemDetailsAction;
    tertiaryAction?: WorkspaceItemDetailsAction;
    pinAction?: WorkspaceItemDetailsAction;
    onClose: () => void;
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function WorkspaceItemDetailsPanel({
    item,
    primaryAction,
    secondaryAction,
    tertiaryAction,
    pinAction,
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

                <Text
                    style={[
                        styles.description,
                        {
                            color: colors.text,
                            textAlign,
                        },
                    ]}
                >
                    {getWorkspaceItemDescription(item, direction)}
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
                        {direction === "ltr" ? "Status" : t("status")}: {getWorkspaceItemStatusLabel(item, direction, t)}
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

            <WorkspaceItemDetailsActions
                itemId={item.id}
                primaryAction={primaryAction}
                secondaryAction={secondaryAction}
                tertiaryAction={tertiaryAction}
                pinAction={pinAction}
                closeLabel={t("closeDetails")}
                onClose={onClose}
            />
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

    description: {
        marginBottom: spacing.xs,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "start",

        opacity: 0.72,
    },

    metaRow: {
        flexDirection: "row",
        alignItems: "center",

        gap: spacing.md,
    },

    metaText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,

        opacity: 0.64,
    },
});

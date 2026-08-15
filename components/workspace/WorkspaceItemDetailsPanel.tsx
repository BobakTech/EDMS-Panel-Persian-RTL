/**
 * ============================================================================
 * Workspace Item Details Panel
 * ----------------------------------------------------------------------------
 * Displays metadata, icon actions, and cursor-following tooltips for the
 * selected workspace item.
 * ============================================================================
 */

import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "../../web/ui";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

import {
    getWorkspaceItemLabel,
    getWorkspaceItemUpdatedAtLabel,
} from "./workspace.helpers";

import type { WorkspaceItem } from "./workspace.types";

/**
 * ============================================================================
 * Types
 * ============================================================================
 */

type WorkspaceItemDetailsActionTone = "primary" | "warning" | "danger";

interface WorkspaceItemDetailsAction {
    label: string;
    icon?: string;
    accessibilityLabel: string;
    tone?: WorkspaceItemDetailsActionTone;
    onPress: (itemId: string) => void;
}

interface WorkspaceTooltipState {
    key: string;
    label: string;
    x: number;
    y: number;
}

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
    onClose: () => void;
}

/**
 * ============================================================================
 * Helpers
 * ============================================================================
 */

function getWorkspaceItemStatusLabel(item: WorkspaceItem) {
    if (item.status === "archived") {
        return "آرشیو";
    }

    if (item.status === "trashed") {
        return "سطل زباله";
    }

    return "فعال";
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
    onClose,
}: WorkspaceItemDetailsPanelProps) {
    const { theme } = useSettings();
    const colors = theme.colors;

    const warningColor = "#D97706";
    const dangerColor = "#DC2626";

    const [visibleTooltip, setVisibleTooltip] =
        useState<WorkspaceTooltipState | null>(null);

    function getActionColor(action: WorkspaceItemDetailsAction) {
        if (action.tone === "danger") {
            return dangerColor;
        }

        if (action.tone === "warning") {
            return warningColor;
        }

        return colors.primary;
    }

    function handleShowTooltip(key: string, label: string, event: any) {
        const nativeEvent = event.nativeEvent ?? {};

        setVisibleTooltip({
            key,
            label,
            x: (nativeEvent.locationX ?? nativeEvent.offsetX ?? 0) + 14,
            y: (nativeEvent.locationY ?? nativeEvent.offsetY ?? 0) + 14,
        });
    }

    function renderTooltip(key: string) {
        if (!visibleTooltip || visibleTooltip.key !== key) {
            return null;
        }

        return (
            <View
                style={[
                    styles.tooltip,
                    {
                        left: visibleTooltip.x,
                        top: visibleTooltip.y,
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.tooltipText,
                        {
                            color: colors.text,
                        },
                    ]}
                >
                    {visibleTooltip.label}
                </Text>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                },
            ]}
        >
            <View style={styles.content}>
                <Text
                    style={[
                        styles.label,
                        {
                            color: colors.primary,
                        },
                    ]}
                >
                    {getWorkspaceItemLabel(item)}
                </Text>

                <Text
                    style={[
                        styles.title,
                        {
                            color: colors.text,
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
                        },
                    ]}
                >
                    {item.description}
                </Text>

                <View style={styles.metaRow}>
                    <Text
                        style={[
                            styles.metaText,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        وضعیت: {getWorkspaceItemStatusLabel(item)}
                    </Text>

                    <Text
                        style={[
                            styles.metaText,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {getWorkspaceItemUpdatedAtLabel(item)}
                    </Text>
                </View>
            </View>

            {/* Primary Item Action */}
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={primaryAction.accessibilityLabel}
                onHoverIn={(event) =>
                    handleShowTooltip(
                        "primary",
                        primaryAction.accessibilityLabel,
                        event
                    )
                }
                onPointerMove={(event) =>
                    handleShowTooltip(
                        "primary",
                        primaryAction.accessibilityLabel,
                        event
                    )
                }
                onHoverOut={() => setVisibleTooltip(null)}
                onPress={() => primaryAction.onPress(item.id)}
                style={[
                    styles.actionButton,
                    {
                        borderColor: getActionColor(primaryAction),
                    },
                ]}
            >
                <Text
                    style={[
                        styles.actionButtonText,
                        {
                            color: getActionColor(primaryAction),
                        },
                    ]}
                >
                    {primaryAction.icon ?? primaryAction.label}
                </Text>

                {renderTooltip("primary")}
            </Pressable>

            {/* Secondary Item Action */}
            {secondaryAction && (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={secondaryAction.accessibilityLabel}
                    onHoverIn={(event) =>
                        handleShowTooltip(
                            "secondary",
                            secondaryAction.accessibilityLabel,
                            event
                        )
                    }
                    onPointerMove={(event) =>
                        handleShowTooltip(
                            "secondary",
                            secondaryAction.accessibilityLabel,
                            event
                        )
                    }
                    onHoverOut={() => setVisibleTooltip(null)}
                    onPress={() => secondaryAction.onPress(item.id)}
                    style={[
                        styles.actionButton,
                        {
                            borderColor: getActionColor(secondaryAction),
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.actionButtonText,
                            {
                                color: getActionColor(secondaryAction),
                            },
                        ]}
                    >
                        {secondaryAction.icon ?? secondaryAction.label}
                    </Text>

                    {renderTooltip("secondary")}
                </Pressable>
            )}

            {/* Tertiary Item Action */}
            {tertiaryAction && (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={tertiaryAction.accessibilityLabel}
                    onHoverIn={(event) =>
                        handleShowTooltip(
                            "tertiary",
                            tertiaryAction.accessibilityLabel,
                            event
                        )
                    }
                    onPointerMove={(event) =>
                        handleShowTooltip(
                            "tertiary",
                            tertiaryAction.accessibilityLabel,
                            event
                        )
                    }
                    onHoverOut={() => setVisibleTooltip(null)}
                    onPress={() => tertiaryAction.onPress(item.id)}
                    style={[
                        styles.actionButton,
                        {
                            borderColor: getActionColor(tertiaryAction),
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.actionButtonText,
                            {
                                color: getActionColor(tertiaryAction),
                            },
                        ]}
                    >
                        {tertiaryAction.icon ?? tertiaryAction.label}
                    </Text>

                    {renderTooltip("tertiary")}
                </Pressable>
            )}

            {/* Close Details Action */}
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="بستن جزئیات"
                onHoverIn={(event) =>
                    handleShowTooltip("close", "بستن جزئیات", event)
                }
                onPointerMove={(event) =>
                    handleShowTooltip("close", "بستن جزئیات", event)
                }
                onHoverOut={() => setVisibleTooltip(null)}
                onPress={onClose}
                style={[
                    styles.closeButton,
                    {
                        borderColor: colors.border,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.closeButtonText,
                        {
                            color: colors.primary,
                        },
                    ]}
                >
                    ×
                </Text>

                {renderTooltip("close")}
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
    },

    content: {
        flex: 1,
    },

    label: {
        marginBottom: spacing.xs,

        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    title: {
        marginBottom: spacing.xs,

        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    description: {
        marginBottom: spacing.xs,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",

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

    actionButton: {
        position: "relative",

        minWidth: 40,

        marginRight: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.md,

        overflow: "visible",
    },

    actionButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    closeButton: {
        position: "relative",

        minWidth: 40,

        marginRight: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.md,

        overflow: "visible",
    },

    closeButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
    },

    tooltip: {
        position: "absolute",

        minWidth: 120,

        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,

        borderWidth: 1,
        borderRadius: radius.md,

        zIndex: 50,

        pointerEvents: "none",

        ...shadows.sm,
    },

    tooltipText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        textAlign: "center",
    },
});

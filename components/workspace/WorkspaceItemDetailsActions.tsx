import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "../../web/ui";
import { radius, semanticColors, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

type WorkspaceItemDetailsActionTone = "primary" | "warning" | "danger";

export interface WorkspaceItemDetailsAction {
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

interface WorkspaceItemDetailsActionsProps {
    itemId: string;
    primaryAction: WorkspaceItemDetailsAction;
    secondaryAction?: WorkspaceItemDetailsAction;
    tertiaryAction?: WorkspaceItemDetailsAction;
    closeLabel: string;
    onClose: () => void;
}

export default function WorkspaceItemDetailsActions({
    itemId,
    primaryAction,
    secondaryAction,
    tertiaryAction,
    closeLabel,
    onClose,
}: WorkspaceItemDetailsActionsProps) {
    const { theme } = useSettings();
    const colors = theme.colors;
    const [visibleTooltip, setVisibleTooltip] =
        useState<WorkspaceTooltipState | null>(null);

    function getDetailsActionColor(action: WorkspaceItemDetailsAction) {
        if (action.tone === "danger") {
            return semanticColors.destructive;
        }

        if (action.tone === "warning") {
            return semanticColors.warningStrong;
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
                <Text style={[styles.tooltipText, { color: colors.text }]}>
                    {visibleTooltip.label}
                </Text>
            </View>
        );
    }

    const actions = [
        { key: "primary", action: primaryAction },
        { key: "secondary", action: secondaryAction },
        { key: "tertiary", action: tertiaryAction },
    ] as const;

    return (
        <>
            {actions.map(({ key, action }) => {
                if (!action) {
                    return null;
                }

                const actionColor = getDetailsActionColor(action);

                return (
                    <Pressable
                        key={key}
                        accessibilityRole="button"
                        accessibilityLabel={action.accessibilityLabel}
                        onHoverIn={(event) =>
                            handleShowTooltip(key, action.accessibilityLabel, event)
                        }
                        onPointerMove={(event) =>
                            handleShowTooltip(key, action.accessibilityLabel, event)
                        }
                        onHoverOut={() => setVisibleTooltip(null)}
                        onPress={() => action.onPress(itemId)}
                        style={[
                            styles.button,
                            { borderColor: actionColor },
                        ]}
                    >
                        <Text
                            style={[
                                styles.actionButtonText,
                                { color: actionColor },
                            ]}
                        >
                            {action.icon ?? action.label}
                        </Text>

                        {renderTooltip(key)}
                    </Pressable>
                );
            })}

            <Pressable
                accessibilityRole="button"
                accessibilityLabel={closeLabel}
                onHoverIn={(event) =>
                    handleShowTooltip("close", closeLabel, event)
                }
                onPointerMove={(event) =>
                    handleShowTooltip("close", closeLabel, event)
                }
                onHoverOut={() => setVisibleTooltip(null)}
                onPress={onClose}
                style={[
                    styles.button,
                    { borderColor: colors.border },
                ]}
            >
                <Text style={[styles.closeButtonText, { color: colors.primary }]}>
                    ×
                </Text>

                {renderTooltip("close")}
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    button: {
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

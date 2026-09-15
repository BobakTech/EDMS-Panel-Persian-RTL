import { Feather } from "../../web/icons";
import { Pressable, StyleSheet, Text } from "../../web/ui";
import { radius, semanticColors, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import Tooltip from "../common/Tooltip";

type WorkspaceItemDetailsActionTone = "primary" | "warning" | "danger";

export interface WorkspaceItemDetailsAction {
    label: string;
    icon?: string;
    accessibilityLabel: string;
    tone?: WorkspaceItemDetailsActionTone;
    isActive?: boolean;
    onPress: (itemId: string) => void;
}

interface WorkspaceItemDetailsActionsProps {
    itemId: string;
    primaryAction: WorkspaceItemDetailsAction;
    secondaryAction?: WorkspaceItemDetailsAction;
    tertiaryAction?: WorkspaceItemDetailsAction;
    pinAction?: WorkspaceItemDetailsAction;
    closeLabel: string;
    onClose: () => void;
}

export default function WorkspaceItemDetailsActions({
    itemId,
    primaryAction,
    secondaryAction,
    tertiaryAction,
    pinAction,
    closeLabel,
    onClose,
}: WorkspaceItemDetailsActionsProps) {
    const { theme } = useSettings();
    const colors = theme.colors;

    function getDetailsActionColor(action: WorkspaceItemDetailsAction) {
        if (action.tone === "danger") {
            return semanticColors.destructive;
        }

        if (action.tone === "warning") {
            return semanticColors.warningStrong;
        }

        return colors.primary;
    }

    const actions = [
        { key: "pin", action: pinAction },
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
                    <Tooltip
                        key={key}
                        label={action.accessibilityLabel}
                    >
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={action.accessibilityLabel}
                            onPress={() => action.onPress(itemId)}
                            style={[
                                styles.button,
                                {
                                    borderColor: actionColor,
                                    backgroundColor: action.isActive
                                        ? `color-mix(in srgb, ${actionColor} 14%, transparent)`
                                        : "transparent",
                                },
                            ]}
                        >
                            {action.icon === "pin" ? (
                                <Feather
                                    name="pin"
                                    size={16}
                                    color={actionColor}
                                />
                            ) : (
                                <Text
                                    style={[
                                        styles.actionButtonText,
                                        {
                                            color: actionColor,
                                        },
                                    ]}
                                >
                                    {action.icon ?? action.label}
                                </Text>
                            )}
                        </Pressable>
                    </Tooltip>
                );
            })}

            <Tooltip label={closeLabel}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={closeLabel}
                    onPress={onClose}
                    style={[
                        styles.button,
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
                </Pressable>
            </Tooltip>
        </>
    );
}

const styles = StyleSheet.create({
    button: {
        minWidth: 40,
        marginRight: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderRadius: radius.md,
    },

    actionButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    closeButtonText: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.semibold,
    },
});
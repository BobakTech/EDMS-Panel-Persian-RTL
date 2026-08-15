/**
 * ============================================================================
 * Workspace Item Card
 * ----------------------------------------------------------------------------
 * Displays a folder or file in card and list layouts.
 * ============================================================================
 */

import { Feather } from "../../web/icons";
import { useState } from "react";

import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "../../web/ui";

import { radius, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import type { TranslationKey } from "../../locales";

import type {
    WorkspaceItem,
    WorkspaceViewMode,
} from "./workspace.types";

/**
 * ============================================================================
 * Types
 * ============================================================================
 */

type FeatherIconName = keyof typeof Feather.glyphMap;

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface WorkspaceItemCardProps {
    item: WorkspaceItem;
    viewMode: WorkspaceViewMode;
    isCompact: boolean;
    isSelected: boolean;
    onPress: (itemId: string) => void;
    onOpenActions?: (itemId: string) => void;
    onTogglePinned: (itemId: string) => void;
}

/**
 * ============================================================================
 * Helpers
 * ============================================================================
 */

function getItemIconName(item: WorkspaceItem): FeatherIconName {
    return item.type === "folder" ? "folder" : "file-text";
}

type Translate = (key: TranslationKey) => string;

function getItemTypeLabel(item: WorkspaceItem, t: Translate) {
    if (item.type === "folder") {
        return t("folder");
    }

    return item.extension?.toUpperCase() ?? t("file");
}

function getItemMetaLabel(item: WorkspaceItem, t: Translate) {
    if (item.type === "folder") {
        return `${item.childrenCount ?? 0} ${t("items")}`;
    }

    return item.sizeLabel ?? t("unknown");
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function WorkspaceItemCard({
    item,
    viewMode,
    isCompact,
    isSelected,
    onPress,
    onOpenActions,
    onTogglePinned,
}: WorkspaceItemCardProps) {
    const { t, theme } = useSettings();
    const colors = theme.colors;
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const isListMode = viewMode === "list";
    const depthColor = `color-mix(in srgb, ${colors.primary} 28%, ${colors.border})`;
    const ambientShadow = "rgba(0, 0, 0, 0.18)";

    return (
        <View
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => {
                setIsHovered(false);
                setIsPressed(false);
            }}
            onPointerDown={() => setIsPressed(true)}
            onPointerUp={() => setIsPressed(false)}
            onPointerCancel={() => setIsPressed(false)}
            style={[
                styles.card,
                isListMode ? styles.listCard : styles.gridCard,
                !isListMode && isCompact && styles.compactGridCard,
                {
                    backgroundColor: colors.surface,
                    borderColor: isSelected
                        ? colors.primary
                        : `color-mix(in srgb, ${colors.primary} 38%, ${colors.border})`,
                    boxShadow: isPressed
                        ? `inset 0 1px 0 color-mix(in srgb, ${colors.surface} 75%, transparent), 0 1px 0 ${depthColor}, 0 3px 7px ${ambientShadow}`
                        : isHovered
                            ? `inset 0 1px 0 color-mix(in srgb, ${colors.surface} 75%, transparent), 0 5px 0 ${depthColor}, 0 12px 22px ${ambientShadow}`
                            : `inset 0 1px 0 color-mix(in srgb, ${colors.surface} 75%, transparent), 0 3px 0 ${depthColor}, 0 7px 14px ${ambientShadow}`,
                    transform: isPressed
                        ? "translateY(2px)"
                        : isHovered
                            ? "translateY(-2px)"
                            : "translateY(0)",
                },
                isSelected && styles.selectedCard,
            ]}
        >
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.isPinned ? t("unpinItem") : t("pinItem")}
                accessibilityState={{ selected: Boolean(item.isPinned) }}
                onPress={() => onTogglePinned(item.id)}
                style={({ pressed }) => [
                    styles.pinButton,
                    isListMode && styles.listPinButton,
                    {
                        backgroundColor: colors.background,
                        borderColor: item.isPinned ? colors.primary : colors.border,
                    },
                    pressed && styles.pressedButton,
                ]}
            >
                <Feather
                    name="star"
                    size={15}
                    color={item.isPinned ? colors.primary : colors.text}
                />
            </Pressable>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t("showItemActions")} ${item.name}`}
                onPress={() => onOpenActions?.(item.id)}
                style={({ pressed }) => [
                    styles.actionsButton,
                    isListMode && styles.listActionsButton,
                    {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                    },
                    pressed && styles.pressedButton,
                ]}
            >
                <Feather
                    name="more-horizontal"
                    size={16}
                    color={colors.text}
                />
            </Pressable>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t("openItem")} ${item.name}`}
                onPress={() => onPress(item.id)}
                style={[
                    styles.contentButton,
                    isListMode && styles.listContentButton,
                ]}
            >
                <View
                    style={[
                        styles.iconMetaRow,
                        isListMode && styles.listIconMetaRow,
                    ]}
                >
                    <View style={styles.itemIcon}>
                        <Feather
                            name={getItemIconName(item)}
                            size={30}
                            color={colors.primary}
                        />
                    </View>

                    <View
                        style={[
                            styles.typePill,
                            {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.typePillText,
                                {
                                    color: colors.primary,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {getItemTypeLabel(item, t)}
                        </Text>
                    </View>
                </View>

                <View
                    style={[
                        styles.textArea,
                        isListMode && styles.listTextArea,
                    ]}
                >
                    <Text
                        style={[
                            styles.name,
                            {
                                color: colors.text,
                            },
                        ]}
                        numberOfLines={2}
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
                        numberOfLines={2}
                    >
                        {item.description}
                    </Text>

                    <Text
                        style={[
                            styles.meta,
                            {
                                color: colors.text,
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {getItemMetaLabel(item, t)}
                    </Text>
                </View>
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
    card: {
        position: "relative",

        borderWidth: 1.5,
        borderRadius: radius.lg,
        transition: "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
        willChange: "transform, box-shadow",
    },

    gridCard: {
        width: 240,
        maxWidth: "100%",
    },

    compactGridCard: {
        width: "48%",
        minWidth: 0,
        maxWidth: "48%",
    },

    listCard: {
        width: "100%",
    },

    selectedCard: {
        borderWidth: 2,
    },

    actionsButton: {
        position: "absolute",
        top: spacing.sm,
        right: spacing.sm,
        zIndex: 2,

        width: 30,
        height: 30,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.pill,
    },

    pinButton: {
        position: "absolute",
        top: spacing.sm,
        left: spacing.sm,
        zIndex: 2,

        width: 30,
        height: 30,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.pill,
    },

    listPinButton: {
        left: 46,
    },

    listActionsButton: {
        right: "auto",
        left: spacing.sm,
    },

    pressedButton: {
        opacity: 0.82,
    },

    contentButton: {
        minHeight: 160,

        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,

        justifyContent: "space-between",

        gap: spacing.md,
    },

    listContentButton: {
        minHeight: 88,

        flexDirection: "row",
        alignItems: "center",

        paddingVertical: spacing.md,
    },

    iconMetaRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",

        paddingRight: 42,

        gap: spacing.sm,
    },

    listIconMetaRow: {
        flexShrink: 0,

        paddingRight: 0,

        justifyContent: "flex-start",
    },

    itemIcon: {
        minHeight: 34,

        alignItems: "center",
        justifyContent: "center",
    },

    typePill: {
        maxWidth: 76,

        marginTop: spacing.xs,

        paddingHorizontal: spacing.sm,
        paddingVertical: 3,

        borderWidth: 1,
        borderRadius: radius.pill,
    },

    typePillText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "center",
    },

    textArea: {
        alignItems: "flex-start",

        width: "100%",
        direction: "rtl",

        gap: spacing.xs,
    },

    listTextArea: {
        flex: 1,
        minWidth: 0,
        alignItems: "flex-start",
    },

    name: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        textAlign: "right",
    },

    description: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",

        opacity: 0.64,
    },

    meta: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",

        opacity: 0.56,
    },
});

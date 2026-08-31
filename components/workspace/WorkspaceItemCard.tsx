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
import { getDirectionalLayout } from "../../settings/direction";
import type {
    WorkspaceItem,
    WorkspaceViewMode,
} from "./workspace.types";
import {
    getWorkspaceFileExtension,
    getWorkspaceItemDescription,
    getWorkspaceItemLabel,
    getWorkspaceItemUpdatedAtLabel,
} from "./workspace.helpers";

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
}

/**
 * ============================================================================
 * Helpers
 * ============================================================================
 */

function getItemIconName(item: WorkspaceItem): FeatherIconName {
    return item.type === "folder" ? "folder" : "file-text";
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
}: WorkspaceItemCardProps) {
    const { direction, language, t, theme } = useSettings();
    const colors = theme.colors;
    const { isRtl } = getDirectionalLayout(direction);
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const isListMode = viewMode === "list";
    const depthColor = `color-mix(in srgb, ${colors.primary} 28%, ${colors.border})`;
    const ambientShadow = "rgba(0, 0, 0, 0.18)";

    const itemDescription = getWorkspaceItemDescription(item, direction);

    const normalizedItemName = item.name.trim().toLocaleLowerCase();
    const normalizedItemDescription = itemDescription.trim().toLocaleLowerCase();

    const shouldShowDescription =
        Boolean(itemDescription) &&
        normalizedItemDescription !== normalizedItemName;

    const itemTypeLabel =
        item.type === "folder"
            ? getWorkspaceItemLabel(item, t)
            : (
                item.extension ??
                getWorkspaceFileExtension(item.name)
            ).toUpperCase();

    const rawItemSizeLabel =
        getWorkspaceItemUpdatedAtLabel(item, t, language);

    const itemSizeLabel =
        item.type === "file" &&
            /^\d+(?:[.,]\d+)?$/.test(rawItemSizeLabel.trim())
            ? `${rawItemSizeLabel} MB`
            : rawItemSizeLabel;

    const itemMetaLabel =
        item.type === "folder"
            ? itemSizeLabel
            : `${itemTypeLabel} · ${itemSizeLabel}`;

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
                    backgroundColor: isSelected
                        ? `color-mix(in srgb, ${colors.primary} 8%, ${colors.surface})`
                        : colors.surface,

                    borderColor: isSelected
                        ? colors.primary
                        : `color-mix(in srgb, ${colors.primary} 38%, ${colors.border})`,

                    boxShadow: isSelected
                        ? `inset 0 0 0 1px color-mix(in srgb, ${colors.primary} 34%, transparent), 0 3px 0 ${depthColor}, 0 8px 18px ${ambientShadow}`
                        : isPressed
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
            <View
                style={[
                    styles.cardActionCluster,
                    isListMode && styles.listCardActionCluster,
                    {
                        left: isRtl ? spacing.sm : "auto",
                        right: isRtl ? "auto" : spacing.sm,
                    },
                ]}
            >
                {item.isPinned && (
                    <View
                        title={t("unpinItem")}
                        accessibilityRole="img"
                        accessibilityLabel={t("unpinItem")}
                        style={[
                            styles.pinnedIndicator,
                            {
                                backgroundColor: `color-mix(in srgb, ${colors.primary} 16%, ${colors.surface})`,
                                borderColor: colors.primary,
                            },
                        ]}
                    >
                        <Feather
                            name="pin"
                            size={14}
                            color={colors.primary}
                        />
                    </View>
                )}

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${t("showItemActions")} ${item.name}`}
                    onPress={() => onOpenActions?.(item.id)}
                    style={({ pressed }) => [
                        styles.actionsButton,
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
            </View>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t("openItem")} ${item.name}`}
                onPress={() => onPress(item.id)}
                style={[
                    styles.contentButton,
                    isListMode && styles.listContentButton,
                    isListMode && !isRtl && styles.ltrListContentButton,
                    { direction },
                ]}
            >
                <View
                    style={[
                        styles.iconMetaRow,
                        isListMode && styles.listIconMetaRow,
                        isListMode && !isRtl && styles.ltrListIconMetaRow,
                    ]}
                >
                    <View style={styles.itemIcon}>
                        <Feather
                            name={getItemIconName(item)}
                            size={24}
                            color={colors.primary}
                        />
                    </View>

                    {isListMode && (
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
                                {getWorkspaceItemLabel(item, t)}
                            </Text>
                        </View>
                    )}
                </View>

                <View
                    style={[
                        styles.textArea,
                        isListMode && styles.listTextArea,
                        {
                            direction,
                            alignItems: isListMode && !isRtl
                                ? "stretch"
                                : "flex-start",
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.name,
                            {
                                color: colors.text,
                                textAlign: isRtl ? "start" : "left",
                            },
                        ]}
                        numberOfLines={isListMode ? 1 : 2}
                        dir="auto"
                    >
                        {item.name}
                    </Text>

                    {shouldShowDescription && (
                        <Text
                            style={[
                                styles.description,
                                {
                                    color: colors.text,
                                    textAlign: isRtl ? "start" : "left",
                                },
                            ]}
                            numberOfLines={1}
                            dir="auto"
                        >
                            {itemDescription}
                        </Text>
                    )}

                    <Text
                        style={[
                            styles.meta,
                            isListMode && !isRtl && styles.ltrListMeta,
                            {
                                color: colors.text,
                                textAlign: isRtl ? "right" : "left",
                                borderColor: colors.border,
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {itemMetaLabel}
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

        transition:
            "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
        willChange: "transform, box-shadow",
    },

    gridCard: {
        width: 252,
        maxWidth: "100%",
        height: 142,
    },

    compactGridCard: {
        width: "48%",
        minWidth: 0,
        maxWidth: "48%",
    },

    listCard: {
        width: "100%",
        height: 68,
    },

    selectedCard: {
        borderWidth: 2,
    },

    cardActionCluster: {
        position: "absolute",
        top: spacing.sm,
        zIndex: 2,

        flexDirection: "row",
        alignItems: "center",

        gap: 6,
    },

    listCardActionCluster: {
        top: 19,
    },

    actionsButton: {
        width: 30,
        height: 30,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.pill,
    },

    pinnedIndicator: {
        width: 26,
        height: 26,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.pill,
    },

    pressedButton: {
        opacity: 0.82,
    },

    contentButton: {
        width: "100%",
        height: "100%",

        paddingHorizontal: spacing.md,
        paddingTop: 40,
        paddingBottom: 10,

        justifyContent: "flex-start",

        gap: 5,
    },

    listContentButton: {
        width: "100%",
        height: 68,
        minHeight: 0,

        flexDirection: "row",
        alignItems: "center",

        paddingTop: 8,
        paddingBottom: 8,
        paddingRight: 88,
        paddingLeft: 88,

        gap: spacing.md,
    },

    ltrListContentButton: {
        paddingRight: 88,
        paddingLeft: 88,
    },

    iconMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",

        width: "100%",
        paddingHorizontal: 0,

        gap: 6,
    },

    listIconMetaRow: {
        width: "auto",
        flexShrink: 0,

        paddingHorizontal: 0,

        alignItems: "center",
        justifyContent: "flex-start",

        gap: spacing.sm,
    },

    ltrListIconMetaRow: {
        paddingHorizontal: 0,
    },

    itemIcon: {
        width: 28,
        height: 28,

        alignItems: "center",
        justifyContent: "center",
    },

    typePill: {
        maxWidth: 84,

        marginTop: 0,

        paddingHorizontal: 8,
        paddingVertical: 2,

        borderWidth: 1,
        borderRadius: radius.pill,
    },

    typePillText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "center",
    },

    textArea: {
        flex: 1,

        width: "100%",
        minWidth: 0,

        alignItems: "flex-start",
        justifyContent: "flex-start",

        direction: "rtl",

        gap: 3,
    },

    listTextArea: {
        flex: 1,

        width: "auto",
        minWidth: 0,

        alignItems: "flex-start",
        justifyContent: "center",

        gap: 1,
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
        width: "100%",

        marginTop: "auto",

        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",

        opacity: 0.56,
    },

    ltrListMeta: {
        width: "100%",

        marginTop: 0,
        paddingTop: 0,

        borderTopWidth: 0,

        opacity: 0.56,
    },
});

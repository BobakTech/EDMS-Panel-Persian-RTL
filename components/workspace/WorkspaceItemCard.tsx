/**
 * ============================================================================
 * Workspace Item Card
 * ----------------------------------------------------------------------------
 * Displays a folder or file in card and list layouts.
 * Supports animated workspace multi-selection independently from item opening.
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
    getWorkspaceItemLabel,
    getWorkspaceItemUpdatedAtLabel,
} from "./workspace.helpers";

import Tooltip from "../common/Tooltip";

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

    /**
     * Indicates that the card is active because its preview or another
     * single-item interaction is open.
     */
    isSelected: boolean;

    /**
     * Indicates that the item belongs to the workspace multi-selection.
     */
    isMultiSelected: boolean;

    onPress: (itemId: string) => void;
    onToggleSelection: (itemId: string) => void;
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
 * Shortens only the Workspace card label.
 *
 * Duplicate suffix detection is intentionally strict:
 * - It must be the final numeric parenthesized segment immediately before
 *   the extension, e.g. "(1).jpg", "(12).pdf".
 * - Other parentheses inside the filename are treated as normal filename text.
 *
 * Examples:
 *   report (draft) final.jpg      -> normal truncation
 *   report (draft) final (1).jpg  -> preserves "(1).jpg"
 */
function getWorkspaceCardItemName(
    item: WorkspaceItem,
    maxLength = 26
): string {
    const itemName = item.name;

    if (itemName.length <= maxLength) {
        return itemName;
    }

    if (item.type === "folder") {
        return `${itemName.slice(
            0,
            Math.max(4, maxLength - 3)
        )}...`;
    }

    const duplicateMatch =
        itemName.match(/(\s*\(\d+\))(\.[^./\\]+)$/);

    if (duplicateMatch) {
        const duplicateSuffix = duplicateMatch[1];
        const extension = duplicateMatch[2];
        const preservedSuffix =
            `${duplicateSuffix}${extension}`;

        const baseName = itemName.slice(
            0,
            itemName.length - preservedSuffix.length
        );

        const availableBaseLength = Math.max(
            4,
            maxLength - preservedSuffix.length - 3
        );

        return `${baseName.slice(
            0,
            availableBaseLength
        )}...${preservedSuffix}`;
    }

    const extensionMatch =
        itemName.match(/(\.[^./\\]+)$/);

    if (!extensionMatch) {
        return `${itemName.slice(
            0,
            Math.max(4, maxLength - 3)
        )}...`;
    }

    const extension = extensionMatch[1];

    const baseName = itemName.slice(
        0,
        itemName.length - extension.length
    );

    const availableBaseLength = Math.max(
        4,
        maxLength - extension.length - 3
    );

    return `${baseName.slice(
        0,
        availableBaseLength
    )}...${extension}`;
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
    isMultiSelected,
    onPress,
    onToggleSelection,
}: WorkspaceItemCardProps) {
    const { direction, language, t, theme } =
        useSettings();

    const colors = theme.colors;
    const { isRtl } =
        getDirectionalLayout(direction);

    const [isHovered, setIsHovered] =
        useState(false);

    const [isPressed, setIsPressed] =
        useState(false);

    const isListMode =
        viewMode === "list";

    const isVisuallySelected =
        isSelected || isMultiSelected;

    const depthColor =
        `color-mix(in srgb, ${colors.primary} 28%, ${colors.border})`;

    const ambientShadow =
        "rgba(0, 0, 0, 0.18)";

    const itemTypeLabel =
        item.type === "folder"
            ? getWorkspaceItemLabel(item, t)
            : (
                item.extension ??
                getWorkspaceFileExtension(item.name)
            ).toUpperCase();

    const rawItemSizeLabel =
        getWorkspaceItemUpdatedAtLabel(
            item,
            t,
            language
        );

    const itemSizeLabel =
        item.type === "file" &&
        /^\d+(?:[.,]\d+)?$/.test(
            rawItemSizeLabel.trim()
        )
            ? `${rawItemSizeLabel} MB`
            : rawItemSizeLabel;

    const itemMetaLabel =
        item.type === "folder"
            ? itemSizeLabel
            : `${itemTypeLabel} · ${itemSizeLabel}`;

    const displayItemName =
        getWorkspaceCardItemName(item);

    const selectionLabel =
        isMultiSelected
            ? direction === "rtl"
                ? "لغو انتخاب"
                : "Deselect"
            : direction === "rtl"
                ? "انتخاب"
                : "Select";

    const selectionAccessibilityLabel =
        isMultiSelected
            ? direction === "rtl"
                ? `لغو انتخاب ${item.name}`
                : `Deselect ${item.name}`
            : direction === "rtl"
                ? `انتخاب ${item.name}`
                : `Select ${item.name}`;

    return (
        <View
            onPointerEnter={() =>
                setIsHovered(true)
            }
            onPointerLeave={() => {
                setIsHovered(false);
                setIsPressed(false);
            }}
            onPointerDown={() =>
                setIsPressed(true)
            }
            onPointerUp={() =>
                setIsPressed(false)
            }
            onPointerCancel={() =>
                setIsPressed(false)
            }
            style={[
                styles.card,

                isListMode
                    ? styles.listCard
                    : styles.gridCard,

                !isListMode &&
                    isCompact &&
                    styles.compactGridCard,

                {
                    backgroundColor:
                        isVisuallySelected
                            ? `color-mix(in srgb, ${colors.primary} 8%, ${colors.surface})`
                            : colors.surface,

                    borderColor:
                        isVisuallySelected
                            ? colors.primary
                            : `color-mix(in srgb, ${colors.primary} 38%, ${colors.border})`,

                    boxShadow:
                        isVisuallySelected
                            ? `inset 0 0 0 1px color-mix(in srgb, ${colors.primary} 34%, transparent), 0 3px 0 ${depthColor}, 0 8px 18px ${ambientShadow}`
                            : isPressed
                                ? `inset 0 1px 0 color-mix(in srgb, ${colors.surface} 75%, transparent), 0 1px 0 ${depthColor}, 0 3px 7px ${ambientShadow}`
                                : isHovered
                                    ? `inset 0 1px 0 color-mix(in srgb, ${colors.surface} 75%, transparent), 0 5px 0 ${depthColor}, 0 12px 22px ${ambientShadow}`
                                    : `inset 0 1px 0 color-mix(in srgb, ${colors.surface} 75%, transparent), 0 3px 0 ${depthColor}, 0 7px 14px ${ambientShadow}`,

                    transform:
                        isPressed
                            ? "translateY(2px)"
                            : isHovered
                                ? "translateY(-2px)"
                                : "translateY(0)",
                },

                isVisuallySelected &&
                    styles.selectedCard,
            ]}
        >
            {/*
             * ====================================================================
             * Card Action Cluster
             * --------------------------------------------------------------------
             * Selection is intentionally independent from opening the item.
             * Clicking this control must never open the preview/folder.
             * ====================================================================
             */}

            <View
                style={[
                    styles.cardActionCluster,

                    isListMode &&
                        styles.listCardActionCluster,

                    {
                        left: isRtl
                            ? spacing.sm
                            : "auto",

                        right: isRtl
                            ? "auto"
                            : spacing.sm,
                    },
                ]}
            >
                {item.isPinned && (
                    <Tooltip
                        label={t("unpinItem")}
                    >
                        <View
                            accessibilityRole="img"
                            accessibilityLabel={
                                t("unpinItem")
                            }
                            style={[
                                styles.pinnedIndicator,
                                {
                                    backgroundColor:
                                        `color-mix(in srgb, ${colors.primary} 16%, ${colors.surface})`,

                                    borderColor:
                                        colors.primary,
                                },
                            ]}
                        >
                            <Feather
                                name="pin"
                                size={14}
                                color={
                                    colors.primary
                                }
                            />
                        </View>
                    </Tooltip>
                )}

                <Tooltip
                    label={selectionLabel}
                >
                    <Pressable
                        accessibilityRole="checkbox"
                        accessibilityLabel={
                            selectionAccessibilityLabel
                        }
                        accessibilityState={{
                            checked:
                                isMultiSelected,
                        }}
                        onPress={() =>
                            onToggleSelection(
                                item.id
                            )
                        }
                        style={({ pressed }) => [
                            styles.selectionButton,

                            {
                                backgroundColor:
                                    isMultiSelected
                                        ? colors.primary
                                        : colors.background,

                                borderColor:
                                    isMultiSelected
                                        ? colors.primary
                                        : colors.border,

                                transform:
                                    pressed
                                        ? "scale(0.9)"
                                        : isMultiSelected
                                            ? "scale(1.06)"
                                            : "scale(1)",

                                boxShadow:
                                    isMultiSelected
                                        ? `0 0 0 3px color-mix(in srgb, ${colors.primary} 14%, transparent)`
                                        : "none",
                            },
                        ]}
                    >
                        <Feather
                            name={
                                isMultiSelected
                                    ? "check"
                                    : "square"
                            }
                            size={15}
                            color={
                                isMultiSelected
                                    ? "#ffffff"
                                    : colors.text
                            }
                        />
                    </Pressable>
                </Tooltip>
            </View>

            {/*
             * ====================================================================
             * Card Content
             * --------------------------------------------------------------------
             * Opening remains independent from multi-selection.
             * ====================================================================
             */}

            <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                    `${t("openItem")} ${item.name}`
                }
                onPress={() =>
                    onPress(item.id)
                }
                style={[
                    styles.contentButton,

                    isListMode &&
                        styles.listContentButton,

                    isListMode &&
                        !isRtl &&
                        styles.ltrListContentButton,

                    {
                        direction,
                    },
                ]}
            >
                <View
                    style={[
                        styles.iconMetaRow,

                        isListMode &&
                            styles.listIconMetaRow,

                        isListMode &&
                            !isRtl &&
                            styles.ltrListIconMetaRow,
                    ]}
                >
                    <View
                        style={styles.itemIcon}
                    >
                        <Feather
                            name={
                                getItemIconName(
                                    item
                                )
                            }
                            size={24}
                            color={
                                colors.primary
                            }
                        />
                    </View>

                    {isListMode && (
                        <View
                            style={[
                                styles.typePill,
                                {
                                    backgroundColor:
                                        colors.background,

                                    borderColor:
                                        colors.border,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.typePillText,
                                    {
                                        color:
                                            colors.primary,
                                    },
                                ]}
                                numberOfLines={1}
                            >
                                {getWorkspaceItemLabel(
                                    item,
                                    t
                                )}
                            </Text>
                        </View>
                    )}
                </View>

                <View
                    style={[
                        styles.textArea,

                        isListMode &&
                            styles.listTextArea,

                        {
                            direction,

                            alignItems:
                                isListMode &&
                                !isRtl
                                    ? "stretch"
                                    : "flex-start",
                        },
                    ]}
                >
                    <Text
                        title={item.name}
                        style={[
                            styles.name,

                            isListMode &&
                                styles.listName,

                            {
                                color:
                                    colors.text,

                                textAlign:
                                    isRtl
                                        ? "right"
                                        : "left",
                            },
                        ]}
                        numberOfLines={1}
                        dir="auto"
                    >
                        {isListMode
                            ? item.name
                            : displayItemName}
                    </Text>

                    <Text
                        style={[
                            styles.meta,

                            isListMode &&
                                !isRtl &&
                                styles.ltrListMeta,

                            {
                                color:
                                    colors.text,

                                textAlign:
                                    isRtl
                                        ? "right"
                                        : "left",

                                borderColor:
                                    colors.border,
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
            "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease, background-color 150ms ease",

        willChange:
            "transform, box-shadow, border-color, background-color",
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

    /**
     * ============================================================================
     * Selection / Pin Cluster
     * ============================================================================
     */

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

    selectionButton: {
        width: 30,
        height: 30,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.pill,

        transition:
            "transform 150ms ease, background-color 150ms ease, border-color 150ms ease, box-shadow 180ms ease",

        willChange:
            "transform, background-color, border-color, box-shadow",
    },

    pinnedIndicator: {
        width: 26,
        height: 26,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.pill,

        transition:
            "transform 150ms ease, background-color 150ms ease, border-color 150ms ease",
    },

    pressedButton: {
        opacity: 0.82,
    },

    /**
     * ============================================================================
     * Card Content
     * ============================================================================
     */

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
        paddingHorizontal: spacing.md,

        gap: spacing.sm,
    },

    ltrListContentButton: {
        paddingHorizontal: spacing.md,
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
        fontWeight:
            typography.fontWeight.semibold,

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
        minWidth: 0,

        fontSize:
            typography.fontSize.md,

        fontWeight:
            typography.fontWeight.bold,
    },

    listName: {
        width: "100%",
        minWidth: 0,

        fontWeight: 500,

        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },

    meta: {
        width: "100%",

        marginTop: "auto",

        fontSize:
            typography.fontSize.xs,

        fontWeight:
            typography.fontWeight.semibold,

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
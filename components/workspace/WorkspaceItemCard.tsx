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
import type { CSSProperties } from "react";

import {
    Pressable,
    Text,
    View,
} from "../../web/ui";

import { spacing } from "../../theme";
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

import "./Card.css";
import { cardStyles as styles } from "./CardStyle";
import { mapWorkspaceItemToCard } from "./card.mapper";
import type { Card } from "./Card";

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
    /** A resolved Card is sufficient; legacy WorkspaceItem is optional. */
    item?: WorkspaceItem;
    card?: Card;
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
    /** Disable PMIS selection for presentation-only cards. */
    allowSelection?: boolean;

    onPress: (itemId: string) => void;
    onToggleSelection: (itemId: string) => void;
}

/**
 * ============================================================================
 * Helpers
 * ============================================================================
 */

function getItemIconName(card: Card): FeatherIconName {
    if (card.icon && Object.prototype.hasOwnProperty.call(Feather.glyphMap, card.icon)) return card.icon as FeatherIconName;
    return card.isFolder ? "folder" : "file-text";
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
    card: Card,
    maxLength = 26
): string {
    const itemName = card.name;

    if (itemName.length <= maxLength) {
        return itemName;
    }

    if (card.isFolder) {
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
    card: resolvedCard,
    viewMode,
    isCompact,
    isSelected,
    isMultiSelected,
    allowSelection = true,
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

    // The presentation Card is authoritative. Legacy callers may still supply only an item.
    const card = resolvedCard ?? (item ? mapWorkspaceItemToCard(item) : null);
    if (!card) return null;
    const isDisabled = card.disabled;
    const canOpen = !isDisabled && (card.capabilities.length === 0 || card.can("open"));
    const canSelect = allowSelection && !isDisabled && (card.capabilities.length === 0 || card.can("select"));

    const isVisuallySelected =
        isSelected || isMultiSelected;

    const depthColor =
        `color-mix(in srgb, ${colors.primary} 28%, ${colors.border})`;

    const ambientShadow =
        "rgba(0, 0, 0, 0.18)";

    // PMIS metadata is an optional compatibility source, never a rendering prerequisite.
    const itemTypeLabel = item
        ? (card.isFolder ? getWorkspaceItemLabel(item, t) : (card.extension || item.extension || getWorkspaceFileExtension(card.name)).toUpperCase())
        : (card.extension || card.type).toUpperCase();
    const rawItemSizeLabel = item ? getWorkspaceItemUpdatedAtLabel(item, t, language) : (card.footer || card.size);
    const itemSizeLabel = card.isFile && /^\d+(?:[.,]\d+)?$/.test(rawItemSizeLabel.trim())
        ? `${rawItemSizeLabel} MB` : rawItemSizeLabel;
    const itemMetaLabel = item
        ? (card.isFolder ? itemSizeLabel : `${itemTypeLabel} · ${itemSizeLabel}`)
        : [itemTypeLabel, itemSizeLabel].filter(Boolean).join(" · ");

    const displayItemName = getWorkspaceCardItemName(card);

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
                ? `لغو انتخاب ${card.name}`
                : `Deselect ${card.name}`
            : direction === "rtl"
                ? `انتخاب ${card.name}`
                : `Select ${card.name}`;

    return (
        <View
            className={`${card.cssClassName} ${isListMode ? "card-list" : "card-grid"}${!isListMode && isCompact ? " card-compact" : ""}${isVisuallySelected ? " card-selected" : ""}${isHovered ? " card-hovered" : ""}${isPressed ? " card-pressed" : ""}${isDisabled ? " card-disabled" : ""}`}
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
                {
                    "--card-surface": colors.surface,
                    "--card-primary": colors.primary,
                    "--card-border": colors.border,
                    "--card-depth": depthColor,
                    "--card-shadow": ambientShadow,
                    "--card-selected-surface": `color-mix(in srgb, ${colors.primary} 8%, ${colors.surface})`,
                } as CSSProperties,

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
                {Boolean(item?.isPinned) && (
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

                {canSelect && <Tooltip
                    label={selectionLabel}
                >
                    <Pressable
                        disabled={!canSelect}
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
                                card.id
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
                </Tooltip>}
            </View>

            {/*
             * ====================================================================
             * Card Content
             * --------------------------------------------------------------------
             * Opening remains independent from multi-selection.
             * ====================================================================
             */}

            <Pressable
                disabled={!canOpen}
                accessibilityRole="button"
                accessibilityLabel={
                    `${t("openItem")} ${card.name}`
                }
                onPress={() =>
                    onPress(card.id)
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
                                    card
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
                                {item ? getWorkspaceItemLabel(item, t) : card.type}
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
                        title={card.name}
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
                            ? card.name
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

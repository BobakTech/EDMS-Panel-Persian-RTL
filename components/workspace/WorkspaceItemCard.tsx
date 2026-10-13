/** Generic presentation-only card. Business entities and authorization remain outside the UI. */
import { useState } from "react";
import type { CSSProperties } from "react";
import { Feather } from "../../web/icons";
import { Pressable, Text, View } from "../../web/ui";
import { useSettings } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";
import type { Card } from "./Card";
import "./Card.css";
import { cardStyles as styles } from "./CardStyle";

type FeatherIconName = string;
export interface WorkspaceItemCardProps {
    card: Card;
    viewMode: "grid" | "list";
    isCompact?: boolean;
    isSelected?: boolean;
    isVisited?: boolean;
    isMultiSelected?: boolean;
    onAction: (cardId: string, actionId: string) => void;
}

function iconName(value?: string): FeatherIconName {
    return value?.trim() || "file";
}

function shortenName(name: string, maxLength = 26): string {
    if (name.length <= maxLength) return name;
    const suffix = name.match(/(\s*\(\d+\))?(\.[^./\\]+)$/)?.[0] ?? "";
    const keep = Math.max(4, maxLength - suffix.length - 3);
    return `${name.slice(0, keep)}...${suffix}`;
}

export default function WorkspaceItemCard({ card, viewMode, isCompact = false, isSelected = false, isVisited = false, isMultiSelected = false, onAction }: WorkspaceItemCardProps) {
    const { direction, theme } = useSettings();
    const { isRtl } = getDirectionalLayout(direction);
    const colors = theme.colors;
    const [isHovered, setIsHovered] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const isListMode = viewMode === "list";
    const canOpen = card.can("open");
    const canSelect = card.can("select");
    const extraActions = card.capabilities.filter((capability) => capability.id !== "open" && capability.id !== "select" && card.can(capability.id));
    const selected = isSelected || isMultiSelected;
    const visitedAccent = "#a78bfa";
    const label = [card.extension, card.footer || card.size].filter(Boolean).join(" · ");
    const cardColor = card.color || colors.primary;
    const surfaceVariables = {
        "--card-surface": colors.surface,
        "--card-primary": cardColor,
        "--card-border": colors.border,
        "--card-depth": `color-mix(in srgb, ${cardColor} 28%, ${colors.border})`,
        "--card-shadow": "rgba(0,0,0,0.18)",
        "--card-selected-surface": `color-mix(in srgb, ${cardColor} 8%, ${colors.surface})`,
    } as CSSProperties;

    if (!card.visible) return null;
    return (
        <View className={`${card.cssClassName} ${isListMode ? "card-list" : "card-grid"}${!isListMode && isCompact ? " card-compact" : ""}${selected ? " card-selected" : ""}${isVisited ? " card-visited" : ""}${isHovered ? " card-hovered" : ""}${card.disabled ? " card-disabled" : ""}`}
            style={{ ...surfaceVariables, ...(isVisited && !selected ? { borderColor: visitedAccent, borderBottomColor: visitedAccent } : {}), ...(isVisited && selected ? { outline: `2px solid ${visitedAccent}`, outlineOffset: -5 } : {}) }} onPointerEnter={() => setIsHovered(true)} onPointerLeave={() => { setIsHovered(false); setIsActionMenuOpen(false); }}>
            {isVisited && <View aria-label="Previously opened" title="Previously opened" style={{ position: "absolute", bottom: 7, left: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: visitedAccent, zIndex: 2, pointerEvents: "none" }} />}
            {(canSelect || extraActions.length > 0) && (
                <View style={[styles.cardActionCluster, isListMode && styles.listCardActionCluster, { left: isRtl ? 8 : "auto", right: isRtl ? "auto" : 8 }]}>
                    {canSelect && <Pressable accessibilityRole="checkbox" accessibilityLabel={isRtl ? "انتخاب" : "Select"} accessibilityState={{ checked: isMultiSelected }} onPress={() => onAction(card.id, "select")}
                        style={[styles.selectionButton, { backgroundColor: isMultiSelected ? cardColor : colors.background, borderColor: isMultiSelected ? cardColor : colors.border }]}>
                        <Feather name={isMultiSelected ? "check" : "square"} size={15} color={isMultiSelected ? "#ffffff" : colors.text} />
                    </Pressable>}
                    {extraActions.length > 0 && <View style={{ position: "relative", zIndex: isActionMenuOpen ? 20 : 1 }}>
                        <Pressable accessibilityRole="button" accessibilityLabel={isRtl ? "اقدامات کارت" : "Card actions"} onPress={() => setIsActionMenuOpen((open) => !open)} style={{ padding: 5, borderRadius: 6, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}>
                            <Feather name="more-horizontal" size={16} color={colors.text} />
                        </Pressable>
                        {isActionMenuOpen && <View style={{ position: "absolute", top: 30, [isRtl ? "left" : "right"]: 0, minWidth: 140, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 4, zIndex: 30, boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
                            {extraActions.map((action) => <Pressable key={action.id} accessibilityRole="button" accessibilityLabel={action.label || action.id} onPress={() => { setIsActionMenuOpen(false); onAction(card.id, action.id); }} style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 5, backgroundColor: action.id === "trash" || action.id === "delete" ? "rgba(220,38,38,0.12)" : "transparent" }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                    <Feather name={iconName(action.icon || (action.id === "trash" || action.id === "delete" ? "trash-2" : undefined))} size={14} color={action.id === "trash" || action.id === "delete" ? "#ef4444" : colors.text} />
                                    <Text style={{ color: action.id === "trash" || action.id === "delete" ? "#ef4444" : colors.text, fontSize: 12, fontWeight: action.id === "trash" || action.id === "delete" ? "600" : "400" }}>{action.label || action.id}</Text>
                                </View>
                            </Pressable>)}
                        </View>}
                    </View>}
                </View>
            )}
            <Pressable disabled={!canOpen} accessibilityRole="button" accessibilityLabel={`${isRtl ? "باز کردن" : "Open"} ${card.name}`} onPress={() => onAction(card.id, "open")}
                style={[styles.contentButton, isListMode && styles.listContentButton, isListMode && !isRtl && styles.ltrListContentButton, { direction }]}>
                <View style={[styles.iconMetaRow, isListMode && styles.listIconMetaRow, isListMode && !isRtl && styles.ltrListIconMetaRow]}>
                    <View style={styles.itemIcon}><Feather name={iconName(card.icon)} size={24} color={cardColor} /></View>
                    {isListMode && <View style={[styles.typePill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={[styles.typePillText, { color: cardColor }]} numberOfLines={1}>{card.type}</Text>
                    </View>}
                </View>
                <View style={[styles.textArea, isListMode && styles.listTextArea, { direction, alignItems: isListMode && !isRtl ? "stretch" : "flex-start" }]}>
                    <Text title={card.name} style={[styles.name, isListMode && styles.listName, { color: colors.text, textAlign: isRtl ? "right" : "left" }]} numberOfLines={1} dir="auto">{isListMode ? card.name : shortenName(card.name)}</Text>
                    {!!label && <Text style={[styles.meta, isListMode && !isRtl && styles.ltrListMeta, { color: colors.text, textAlign: isRtl ? "right" : "left", borderColor: colors.border }]} numberOfLines={1}>{label}</Text>}
                </View>
            </Pressable>
        </View>
    );
}

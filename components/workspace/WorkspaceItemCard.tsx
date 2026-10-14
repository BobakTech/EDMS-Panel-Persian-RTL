/** Generic presentation-only card. Business entities and authorization remain outside the UI. */
import { useState } from "react";
import type { CSSProperties } from "react";
import { Feather } from "../../web/icons";
import { Pressable, Text, View } from "../../web/ui";
import { useSettings } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";
import type { Card, CardCapability } from "./Card";
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


/** Translate known UI actions, preserving custom action labels supplied by the application. */
function localizedActionLabel(id: string, label: string | undefined, t: ReturnType<typeof useSettings>["t"], rtl: boolean): string {
    switch (id) {
        case "preview": return t("documentPreview");
        case "archive": return t("archive");
        case "trash": return t("moveToTrash");
        case "open": return t("openItem");
        case "select": return t("selectItems");
        case "delete": return t("permanentlyDeleteItem");
        case "restore": return rtl ? "بازیابی" : "Restore";
        default: return label || id;
    }
}


/** One capability-driven menu shared by grid and list cards. */
function CardActionsMenu({ actions, card, isRtl, colors, t, onAction, open, setOpen }: {
    actions: CardCapability[];
    card: Card;
    isRtl: boolean;
    colors: ReturnType<typeof useSettings>["theme"]["colors"];
    t: ReturnType<typeof useSettings>["t"];
    onAction: (cardId: string, actionId: string) => void;
    open: boolean;
    setOpen: (value: boolean | ((previous: boolean) => boolean)) => void;
}) {
    return <View style={{ position: "relative", zIndex: open ? 20 : 1 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${t("showItemActions")} ${card.name}`} onPress={() => setOpen((previous) => !previous)} style={{ padding: 5, borderRadius: 6, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}>
            <Feather name="more-horizontal" size={16} color={colors.text} />
        </Pressable>
        {open && <View style={{ position: "absolute", top: 30, [isRtl ? "left" : "right"]: 0, minWidth: 176, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.primary, borderRadius: 10, padding: 6, zIndex: 30, boxShadow: "0 10px 30px rgba(0,0,0,0.40), 0 0 0 2px rgba(0,0,0,0.14)" }}>
            {actions.map((item) => {
                const destructive = item.id === "trash" || item.id === "delete";
                const title = localizedActionLabel(item.id, item.label, t, isRtl);
                return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={title} onPress={() => { setOpen(false); onAction(card.id, item.id); }} style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 5, backgroundColor: destructive ? "rgba(220,38,38,0.12)" : "transparent" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Feather name={iconName(item.icon || (destructive ? "trash-2" : undefined))} size={14} color={destructive ? "#ef4444" : colors.text} />
                        <Text style={{ color: destructive ? "#ef4444" : colors.text, fontSize: 12, fontWeight: destructive ? "600" : "400" }}>{title}</Text>
                    </View>
                </Pressable>;
            })}
        </View>}
    </View>;
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
    const { direction, theme, t } = useSettings();
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
    const metadata = [card.extension, card.footer || card.size].filter(Boolean);
    const sizePattern = /^\s*[\d.,]+\s*(?:B|KB|MB|GB|TB|KiB|MiB|GiB|TiB|bytes?)\s*$/i;
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
            style={{ ...surfaceVariables, zIndex: isActionMenuOpen ? 100 : 0, ...(isVisited && !selected ? { borderColor: visitedAccent, borderBottomColor: visitedAccent } : {}), ...(isVisited && selected ? { outline: `2px solid ${visitedAccent}`, outlineOffset: -5 } : {}) }} onPointerEnter={() => setIsHovered(true)} onPointerLeave={() => { setIsHovered(false); setIsActionMenuOpen(false); }}>
            {isVisited && <View aria-label={isRtl ? "آخرین مورد بازشده" : "Previously opened"} title={isRtl ? "آخرین مورد بازشده" : "Previously opened"} style={{ position: "absolute", bottom: 7, left: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: visitedAccent, zIndex: 2, pointerEvents: "none" }} />}
            {(canSelect || extraActions.length > 0) && (
                <View style={[styles.cardActionCluster, isListMode && styles.listCardActionCluster, { left: isRtl ? 8 : "auto", right: isRtl ? "auto" : 8 }]}>
                    {canSelect && <Pressable accessibilityRole="checkbox" accessibilityLabel={t("selectItems")} accessibilityState={{ checked: isMultiSelected }} onPress={() => onAction(card.id, "select")}
                        style={[styles.selectionButton, { backgroundColor: isMultiSelected ? cardColor : colors.background, borderColor: isMultiSelected ? cardColor : colors.border }]}>
                        <Feather name={isMultiSelected ? "check" : "square"} size={15} color={isMultiSelected ? "#ffffff" : colors.text} />
                    </Pressable>}
                    {extraActions.length > 0 && <CardActionsMenu actions={extraActions} card={card} isRtl={isRtl} colors={colors} t={t} onAction={onAction} open={isActionMenuOpen} setOpen={setIsActionMenuOpen} />}
                </View>
            )}
            <Pressable disabled={!canOpen} accessibilityRole="button" accessibilityLabel={`${t("openItem")} ${card.name}`} onPress={() => onAction(card.id, "open")}
                style={[styles.contentButton, isListMode && styles.listContentButton, isListMode && !isRtl && styles.ltrListContentButton, { direction }]}>
                <View style={[styles.iconMetaRow, isListMode && styles.listIconMetaRow, isListMode && !isRtl && styles.ltrListIconMetaRow]}>
                    <View style={styles.itemIcon}><Feather name={iconName(card.icon)} size={24} color={cardColor} /></View>
                    {isListMode && <View style={[styles.typePill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <Text style={[styles.typePillText, { color: cardColor }]} numberOfLines={1}>{card.type}</Text>
                    </View>}
                </View>
                <View style={[styles.textArea, isListMode && styles.listTextArea, { direction, alignItems: isListMode && !isRtl ? "stretch" : "flex-start" }]}>
                    <Text title={card.name} style={[styles.name, isListMode && styles.listName, { color: colors.text, textAlign: isRtl ? "right" : "left" }]} numberOfLines={1} dir="auto">{isListMode ? card.name : shortenName(card.name)}</Text>
                    {metadata.length > 0 && <Text style={[styles.meta, isListMode && !isRtl && styles.ltrListMeta, { color: colors.text, textAlign: isRtl ? "right" : "left", borderColor: colors.border }]} numberOfLines={1}>{metadata.map((part, index) => <Text key={`${index}-${part}`} dir={sizePattern.test(part) ? "ltr" : undefined} style={sizePattern.test(part) ? { direction: "ltr", unicodeBidi: "isolate", textAlign: "left" } : undefined}>{index > 0 ? " · " : ""}{part}</Text>)}</Text>}
                </View>
            </Pressable>
        </View>
    );
}

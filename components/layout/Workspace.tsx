/** Generic Workspace renderer. All data, navigation, and actions are supplied by the application. */
import { Feather } from "../../web/icons";
import { Pressable, Text, View } from "../../web/ui";
import { useSettings } from "../../settings/SettingsContext";
import type { WorkspacePresentation } from "../workspace/workspace.presentation";
import WorkspaceItemCard from "../workspace/WorkspaceItemCard";

export interface WorkspaceActionRequest {
    actionId: string;
    cardId?: string;
    targetId?: string | null;
    value?: string | number;
}

export interface WorkspaceProps {
    presentation: WorkspacePresentation;
    onAction: (request: WorkspaceActionRequest) => void;
}

export default function Workspace({ presentation, onAction }: WorkspaceProps) {
    const { direction, theme, t } = useSettings();
    const colors = theme.colors;
    const rtl = direction === "rtl";
    const mode = presentation.display?.mode ?? "grid";
    const selectedIds = new Set(presentation.display?.selectedCardIds ?? []);
    const visitedIds = new Set(presentation.display?.visitedCardIds ?? []);
    const selectedCards = presentation.cards.filter((card) => selectedIds.has(card.id));
    const bulkArchiveCount = selectedCards.filter((card) => card.can("archive")).length;
    const bulkTrashCount = selectedCards.filter((card) => card.can("trash")).length;
    const { page, pageSize, totalItems } = presentation.pagination;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const firstItem = totalItems ? (page - 1) * pageSize + 1 : 0;
    const lastItem = Math.min(page * pageSize, totalItems);
    const isLoading = presentation.loading === true;
    const loadingPreferences = { mode: "both" as const, skeletonCount: 8, disableInteractions: true, ...presentation.loadingPreferences };
    const loadingPlaceholderCount = Math.min(50, Math.max(1, Math.floor(loadingPreferences.skeletonCount)));
    const showSkeleton = loadingPreferences.mode === "skeleton" || loadingPreferences.mode === "both";
    const showSpinner = loadingPreferences.mode === "spinner" || loadingPreferences.mode === "both";
    const blockActions = isLoading && loadingPreferences.disableInteractions;
    const border = `1px solid ${colors.border}`;
    const controlStyle = { padding: 8, borderRadius: 7, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface };
    const action = (actionId: string, fields: Omit<WorkspaceActionRequest, "actionId"> = {}) => onAction({ actionId, ...fields });

    return (
        <View style={{ flex: 1, minWidth: 0, width: "100%", minHeight: 0, padding: 8, gap: 14, backgroundColor: colors.background, direction }}>
            <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <View style={{ flex: 1, minWidth: 220, flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    {!!presentation.title && <Text style={{ fontSize: 19, fontWeight: "700", color: colors.text, textAlign: rtl ? "right" : "left" }}>{presentation.title}</Text>}
                    {!!presentation.subtitle && <Text style={{ color: colors.text, opacity: 0.75 }}>{presentation.subtitle}</Text>}
                    {presentation.navigation.canGoBack && <Pressable accessibilityRole="button" accessibilityLabel={t("back")} onPress={() => action("navigate-back", { targetId: presentation.navigation.parentId })} style={controlStyle}>
                        <Feather name="arrow-left" size={17} color={colors.text} />
                    </Pressable>}
                    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                        {presentation.navigation.breadcrumbs.map((crumb, index) => (
                            <View key={`${crumb.id}-${index}`} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                {index > 0 && <Text style={{ color: colors.text, opacity: 0.5 }}>/</Text>}
                                <Pressable disabled={crumb.disabled} accessibilityRole="button" onPress={() => action("navigate", { targetId: crumb.targetId ?? crumb.id })} style={{ padding: 5 }}>
                                    <Text style={{ color: crumb.disabled ? colors.text : colors.primary }}>{crumb.label}</Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                </View>
                {presentation.actions.filter((item) => item.visible !== false).map((item) => (
                    <Pressable key={item.id} disabled={blockActions || item.disabled} accessibilityRole="button" accessibilityLabel={item.label || item.id} onPress={() => action(item.id)} style={controlStyle}>
                        <Text style={{ color: colors.text }}>{item.label || item.id}</Text>
                    </Pressable>
                ))}
                <Pressable accessibilityRole="button" accessibilityLabel={rtl ? "نمای شبکه‌ای" : "Grid view"} onPress={() => action("set-view-mode", { value: "grid" })} style={{ ...controlStyle, borderColor: mode === "grid" ? colors.primary : colors.border, backgroundColor: mode === "grid" ? colors.primary : colors.surface, boxShadow: mode === "grid" ? `inset 0 0 0 1px ${colors.primary}` : "none" }}>
                    <Feather name="grid" size={17} color={mode === "grid" ? "#ffffff" : colors.text} />
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={rtl ? "نمای فهرستی" : "List view"} onPress={() => action("set-view-mode", { value: "list" })} style={{ ...controlStyle, borderColor: mode === "list" ? colors.primary : colors.border, backgroundColor: mode === "list" ? colors.primary : colors.surface, boxShadow: mode === "list" ? `inset 0 0 0 1px ${colors.primary}` : "none" }}>
                    <Feather name="list" size={17} color={mode === "list" ? "#ffffff" : colors.text} />
                </Pressable>
            </View>
            {selectedCards.length > 0 && <View className="workspace-bulk-toolbar" style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10, padding: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 9, position: "sticky", top: 8, zIndex: 20 }}>
                <Pressable accessibilityRole="button" accessibilityLabel={t("deselectItems")} onPress={() => action("clear-selection")} style={{ ...controlStyle, width: 34, height: 34, alignItems: "center", justifyContent: "center", padding: 0, borderColor: colors.border }}><Feather name="x" size={17} color={colors.text}/></Pressable>
                <Text style={{ color: colors.text, fontWeight: "600" }}>{rtl ? `${selectedCards.length} مورد انتخاب شده` : `${selectedCards.length} selected`}</Text>
                <View style={{ flex: 1 }} />
                {bulkArchiveCount > 0 && <View className="workspace-bulk-action"><Pressable accessibilityRole="button" accessibilityLabel={rtl ? "بایگانی موارد انتخاب‌شده" : "Archive selected"} onPress={() => action("bulk-archive")} style={{ ...controlStyle, paddingHorizontal: 14, borderColor: "#2563eb", backgroundColor: "#1d4ed8", boxShadow: "0 3px 0 #1e40af, 0 5px 12px rgba(0,0,0,.18)", transition: "transform 130ms ease, filter 130ms ease, box-shadow 130ms ease" }}><View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Feather name="archive" size={15} color="#ffffff"/><Text style={{ color: "#ffffff", fontWeight: "600" }}>{t("archive")}</Text></View></Pressable></View>}
                {bulkTrashCount > 0 && <View className="workspace-bulk-action"><Pressable accessibilityRole="button" accessibilityLabel={rtl ? "انتقال موارد انتخاب‌شده به زباله‌دان" : "Move selected to trash"} onPress={() => action("bulk-trash")} style={{ ...controlStyle, paddingHorizontal: 14, borderColor: "#dc2626", backgroundColor: "#b91c1c", boxShadow: "0 3px 0 #7f1d1d, 0 5px 12px rgba(0,0,0,.18)", transition: "transform 130ms ease, filter 130ms ease, box-shadow 130ms ease" }}><View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><Feather name="trash-2" size={15} color="#ffffff"/><Text style={{ color: "#ffffff", fontWeight: "600" }}>{t("moveToTrash")}</Text></View></Pressable></View>}
            </View>}
            {presentation.error ? <Text style={{ color: colors.text }}>{presentation.error}</Text> : null}
            {isLoading ? (
                <View accessibilityRole="progressbar" accessibilityLabel={rtl ? "در حال بارگذاری اسناد" : "Loading documents"} style={{ flex: 1, minHeight: 0, gap: 16 }}>
                    {showSpinner && <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 8 }}>
                        <View className="edms-activity-spinner" style={{ borderColor: colors.border, borderTopColor: colors.primary }} />
                        <Text style={{ color: colors.text, opacity: 0.8 }}>{rtl ? "در حال بارگذاری اسناد..." : "Loading documents..."}</Text>
                    </View>}
                    {showSkeleton && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, direction, alignItems: "flex-start" }}>
                        {Array.from({ length: loadingPlaceholderCount }, (_, index) => (
                            <View key={`workspace-skeleton-${index}`} aria-hidden="true" style={{ width: mode === "list" ? "100%" : 252, height: mode === "list" ? 62 : 144, borderRadius: 11, padding: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 14, opacity: 0.65 }}>
                                <View style={{ width: 23, height: 23, borderRadius: 5, backgroundColor: colors.border }} />
                                <View style={{ width: "75%", height: 13, borderRadius: 5, backgroundColor: colors.border }} />
                                {mode === "grid" && <View style={{ width: "40%", height: 10, borderRadius: 5, backgroundColor: colors.border }} />}
                            </View>
                        ))}
                    </View>}
                </View>
            ) : (
                <View style={{ flex: 1, minHeight: 0, overflowY: "auto" } as any}>
                    {presentation.cards.length === 0 ? <Text style={{ color: colors.text, opacity: 0.7, padding: 20 }}>{presentation.id === "archive" ? t("emptyArchiveTitle") : presentation.id === "trash" ? t("emptyTrashTitle") : t("emptyWorkspaceTitle")}</Text> : (
                        <View className={mode === "grid" ? "workspace-card-grid-layout" : "workspace-card-list-layout"} style={{ direction, ...(mode === "grid" ? { display: "grid" } : {}) }}>
                            {presentation.cards.map((card) => <WorkspaceItemCard key={card.id} card={card} viewMode={mode} isSelected={false} isVisited={visitedIds.has(card.id)} isMultiSelected={selectedIds.has(card.id)} onAction={(cardId, actionId) => action(actionId, { cardId })} />)}
                        </View>
                    )}
                </View>
            )}
            <View style={{ borderTopWidth: 1, borderColor: colors.border, paddingTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <Text style={{ color: colors.text }}>{firstItem}–{lastItem} / {totalItems}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Pressable disabled={page <= 1 || isLoading} accessibilityRole="button" accessibilityLabel={rtl ? "صفحه قبل" : "Previous page"} onPress={() => action("set-page", { value: page - 1 })} style={controlStyle}><Text style={{ color: colors.text }}>«</Text></Pressable>
                    <Text style={{ color: colors.text }}>{page} / {totalPages}</Text>
                    <Pressable disabled={page >= totalPages || isLoading} accessibilityRole="button" accessibilityLabel={rtl ? "صفحه بعد" : "Next page"} onPress={() => action("set-page", { value: page + 1 })} style={controlStyle}><Text style={{ color: colors.text }}>»</Text></Pressable>
                    <View style={{ borderLeftWidth: 1, borderColor: colors.border, paddingLeft: 8 }}>
                        <select aria-label={rtl ? "تعداد موارد در صفحه" : "Items per page"} value={pageSize} onChange={(event) => action("set-page-size", { value: Number(event.target.value) })} style={{ padding: 7, background: colors.surface, color: colors.text, border, borderRadius: 7 }}>
                            {[25, 50, 100, pageSize].filter((size, index, values) => values.indexOf(size) === index).sort((a, b) => a - b).map((size) => <option key={size} value={size}>{size}</option>)}
                        </select>
                    </View>
                </View>
            </View>
        </View>
    );
}

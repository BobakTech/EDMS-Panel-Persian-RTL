/** Responsive document metadata dialog with shared view/edit modes. */
import { useEffect, useState } from "react";
import type { WorkspaceCategoryDefinition, WorkspaceItemUpdate } from "../workspace/workspace.types";
import { Feather } from "../../web/icons";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "../../web/ui";
import { radius, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import type { WorkspaceItem } from "../workspace/workspace.types";
import { getPreviewMetadataPresentation } from "./preview.metadata";

interface Props { item: WorkspaceItem; visible: boolean; onClose: () => void; initialMode?: "view" | "edit"; categoryDefinitions: WorkspaceCategoryDefinition[]; onUpdateItem?: (itemId: string, updates: WorkspaceItemUpdate) => void; }
function splitFileName(name: string) { const i = name.lastIndexOf("."); return i > 0 && i < name.length - 1 ? { base: name.slice(0, i), extension: name.slice(i) } : { base: name, extension: "" }; }
interface MetadataField { key: string; label: string; value: string | number | null | undefined; }

export default function WorkspaceMetadataDialog({ item, visible, onClose, initialMode = "view", categoryDefinitions, onUpdateItem }: Props) {
    const { direction, language, t, theme } = useSettings();
    const colors = theme.colors;
    const rtl = direction === "rtl";
    const [isEditing, setIsEditing] = useState(initialMode === "edit");
    const [draftName, setDraftName] = useState(splitFileName(item.name).base);
    const [draftDescription, setDraftDescription] = useState(item.description ?? "");
    const [draftVersion, setDraftVersion] = useState(item.fileVersion ?? "");
    const [draftDate, setDraftDate] = useState(item.fileDate ?? "");
    const [draftTime, setDraftTime] = useState(item.fileTime ?? "");
    const [draftCategoryId, setDraftCategoryId] = useState(String(item.categoryId ?? "").trim());
    const [draftFileTypeLabel, setDraftFileTypeLabel] = useState(item.fileTypeLabel ?? "");
    function resetDraft() {
        setDraftName(splitFileName(item.name).base);
        setDraftDescription(item.description ?? "");
        setDraftVersion(item.fileVersion ?? "");
        setDraftDate(item.fileDate ?? "");
        setDraftTime(item.fileTime ?? "");
        setDraftCategoryId(String(item.categoryId ?? "").trim());
        setDraftFileTypeLabel(item.fileTypeLabel ?? "");
    }
    useEffect(() => { if (visible) { resetDraft(); setIsEditing(initialMode === "edit" && Boolean(onUpdateItem)); } }, [visible, item.id, initialMode]);
    function save() {
        if (!onUpdateItem || !draftName.trim()) return;
        onUpdateItem(item.id, { name: draftName.trim() + splitFileName(item.name).extension, description: draftDescription, fileVersion: draftVersion.trim(), fileDate: draftDate.trim(), fileTime: draftTime.trim(), fileTypeLabel: draftFileTypeLabel.trim(), categoryId: draftCategoryId || undefined });
        setIsEditing(false);
    }
    function cancel() { resetDraft(); setIsEditing(false); }
    const options = categoryDefinitions.map(c => ({ value: String(c.id).trim(), label: (rtl ? c.nameFa?.trim() || c.nameEn?.trim() : c.nameEn?.trim() || c.nameFa?.trim()) || String(c.id) })).filter(c => c.value);
    if (draftCategoryId && !options.some(c => c.value === draftCategoryId)) options.unshift({ value: draftCategoryId, label: item.fileTypeLabel?.trim() || draftCategoryId });
    const inputStyle = { width: "100%", minWidth: 0, minHeight: 34, paddingInline: 10, paddingBlock: 6, border: `1px solid ${colors.border}`, borderRadius: radius.md, backgroundColor: colors.surface, color: colors.text, fontSize: typography.fontSize.sm, outline: "none" } as const;
    const metadata = getPreviewMetadataPresentation(item, direction, t, language);
    const fields: MetadataField[] = [
        { key: "name", label: rtl ? "نام فایل" : "File name", value: item.name },
        { key: "description", label: rtl ? "توضیحات" : "Description", value: item.description },
        { key: "updated", label: rtl ? "آخرین تغییر" : "Last updated", value: item.updatedAt },
        ...metadata.entries.map(entry => ({ key: entry.key, label: entry.label, value: entry.value })),
    ];
    // Keep every meaningful field once; future metadata can be appended without changing the layout.
    const visibleFields = fields.filter(field => (isEditing && ["name", "description", "version", "date", "time", "fileType"].includes(field.key)) || (field.value !== null && field.value !== undefined && String(field.value).trim() !== ""));
    const statusDescription = item.status === "active"
        ? (rtl ? "این سند در فضای کاری فعال است." : "This document is active in the workspace.")
        : item.status === "archived"
            ? (rtl ? "این سند بایگانی شده است." : "This document is archived.")
            : (rtl ? "این سند به سطل زباله منتقل شده است." : "This document is in the trash.");
    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable accessibilityRole="button" accessibilityLabel={rtl ? "بستن اطلاعات" : "Close information"} onPress={onClose} style={styles.backdrop} />
                <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border, direction }]}>
                    <View style={[styles.header, { borderColor: colors.border }]}>
                        <View style={styles.headingArea}>
                            <View style={[styles.headingIcon, { backgroundColor: colors.background, borderColor: colors.border }]}><Feather name="info" size={19} color={colors.primary} /></View>
                            <View style={styles.headingText}>
                                <Text style={[styles.heading, { color: colors.text }]}>{rtl ? "اطلاعات و فراداده" : "Information & Metadata"}</Text>
                                <Text numberOfLines={1} style={[styles.subtitle, { color: colors.text }]}>{item.name}</Text>
                            </View>
                        </View>
                        <Pressable accessibilityRole="button" accessibilityLabel={rtl ? "بستن" : "Close"} onPress={onClose} style={[styles.close, { backgroundColor: colors.background, borderColor: colors.border }]}><Feather name="x" size={19} color={colors.text} /></Pressable>
                    </View>
                    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator>
                        <View style={[styles.statusCard, { backgroundColor: metadata.status.backgroundColor, borderColor: metadata.status.borderColor }]}>
                            <View style={styles.statusTitleRow}>
                                <View style={[styles.statusDot, { backgroundColor: metadata.status.foregroundColor }]} />
                                <Text style={[styles.statusHeading, { color: metadata.status.foregroundColor }]}>{metadata.status.label}</Text>
                                <View style={[styles.statusBadge, { borderColor: metadata.status.borderColor }]}><Text style={[styles.statusValue, { color: metadata.status.foregroundColor }]}>{metadata.status.value}</Text></View>
                            </View>
                            <Text style={[styles.statusDescription, { color: colors.text }]}>{statusDescription}</Text>
                        </View>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>{rtl ? "مشخصات سند" : "Document details"}</Text>
                            {onUpdateItem && !isEditing && <Pressable accessibilityRole="button" accessibilityLabel={rtl ? "ویرایش" : "Edit"} onPress={() => { resetDraft(); setIsEditing(true); }} style={[styles.action, { backgroundColor: colors.background, borderColor: colors.border }]}><Feather name="edit-3" size={14} color={colors.primary} /><Text style={{ color: colors.primary }}>{rtl ? "ویرایش" : "Edit"}</Text></Pressable>}
                        </View>
                        <View style={[styles.details, { borderColor: colors.border, backgroundColor: colors.background }]}>
                            {visibleFields.map((field, index) => (
                                <View key={field.key} style={[styles.field, index < visibleFields.length - 1 && { borderBottomWidth: 1, borderColor: colors.border }]}>
                                    <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
                                    {isEditing && ["name", "description", "version", "date", "time", "fileType"].includes(field.key) ? (
                                        <View style={styles.value}>
                                            {field.key === "description" ? <textarea value={draftDescription} onChange={event => setDraftDescription(event.target.value)} aria-label={field.label} dir="auto" rows={3} style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontFamily: "inherit" }} /> : field.key === "fileType" ? <select value={draftCategoryId} onChange={event => { const id = event.target.value.trim(); setDraftCategoryId(id); setDraftFileTypeLabel(options.find(option => option.value === id)?.label ?? ""); }} aria-label={rtl ? "نوع فایل" : "File type"} dir={direction} style={{ ...inputStyle, height: 34, minHeight: 34, boxSizing: "border-box", fontFamily: "inherit", cursor: "pointer", textAlign: rtl ? "right" : "left" }}>
                                                <option value="">{rtl ? "انتخاب دسته‌بندی" : "Select category"}</option>
                                                {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                            </select> :
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                                    <input type={field.key === "version" ? "number" : field.key === "time" ? "time" : "text"} min={field.key === "version" ? "0" : undefined} step={field.key === "version" ? "0.01" : field.key === "time" ? "1" : undefined} dir={field.key === "date" ? "auto" : "ltr"} aria-label={field.label} value={field.key === "name" ? draftName : field.key === "version" ? draftVersion : field.key === "date" ? draftDate : draftTime} onChange={event => { const value = event.target.value; if (field.key === "name") setDraftName(value); else if (field.key === "version") setDraftVersion(value); else if (field.key === "date") setDraftDate(value); else setDraftTime(value); }} style={inputStyle} />
                                                    {field.key === "name" && <Text style={{ color: colors.text }}>{splitFileName(item.name).extension}</Text>}
                                                </View>}
                                        </View>
                                    ) : <Text selectable dir="auto" style={[styles.value, { color: colors.text }]}>{String(field.value)}</Text>}
                                </View>
                            ))}
                        </View>
                        {isEditing && <View style={styles.actions}>
                            <Pressable accessibilityRole="button" accessibilityLabel={rtl ? "ذخیره" : "Save"} disabled={!draftName.trim()} onPress={save} style={[styles.action, { backgroundColor: colors.primary, borderColor: colors.primary, opacity: draftName.trim() ? 1 : 0.5 }]}><Feather name="check" size={14} color="#ffffff" /><Text style={{ color: "#ffffff" }}>{rtl ? "ذخیره" : "Save"}</Text></Pressable>
                            <Pressable accessibilityRole="button" accessibilityLabel={rtl ? "انصراف" : "Cancel"} onPress={cancel} style={[styles.action, { backgroundColor: colors.background, borderColor: colors.border }]}><Text style={{ color: colors.text }}>{rtl ? "انصراف" : "Cancel"}</Text></Pressable>
                        </View>}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { position: "fixed", inset: 0, width: "100vw", height: "100dvh", alignItems: "center", justifyContent: "center", padding: spacing.sm, zIndex: 1200 },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.65)" },
    panel: { width: "100%", maxWidth: 680, maxHeight: "calc(100dvh - 20px)", minHeight: 0, borderWidth: 1, borderRadius: radius.lg, overflow: "hidden", boxShadow: "0 22px 70px rgba(0,0,0,0.34)", animation: "edms-workspace-panel-in 180ms ease-out" },
    header: { padding: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, borderBottomWidth: 1 },
    headingArea: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: spacing.sm },
    headingIcon: { width: 40, height: 40, borderWidth: 1, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
    headingText: { flex: 1, minWidth: 0, gap: 3 },
    heading: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
    subtitle: { fontSize: typography.fontSize.xs, opacity: 0.65 },
    close: { width: 34, height: 34, borderWidth: 1, borderRadius: radius.md, alignItems: "center", justifyContent: "center", cursor: "pointer" },
    scroll: { minHeight: 0, maxHeight: "calc(100dvh - 180px)" },
    scrollContent: { padding: spacing.md, gap: spacing.md },
    statusCard: { padding: spacing.md, borderWidth: 1, borderRadius: radius.lg, gap: spacing.sm },
    statusTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
    statusDot: { width: 9, height: 9, borderRadius: 9 },
    statusHeading: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
    statusBadge: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 3 },
    statusValue: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
    statusDescription: { fontSize: typography.fontSize.sm, opacity: 0.85 },
    sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
    actions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    action: { minHeight: 32, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.xs, paddingHorizontal: spacing.sm, borderWidth: 1, borderRadius: radius.md },
    sectionTitle: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold },
    details: { borderWidth: 1, borderRadius: radius.lg, overflow: "hidden" },
    field: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.sm, padding: spacing.sm },
    label: { flexBasis: 125, flexGrow: 1, minWidth: 90, fontSize: typography.fontSize.sm, opacity: 0.65 },
    value: { flexBasis: 180, flexGrow: 2, minWidth: 0, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, overflowWrap: "anywhere" },
});

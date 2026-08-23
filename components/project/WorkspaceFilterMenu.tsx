import { useMemo, useState } from "react";
import { Feather } from "../../web/icons";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "../../web/ui";
import { radius, semanticColors, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";
import { createDefaultWorkspaceFilters } from "./project.filters";
import type { ProjectFilterOption, WorkspaceFilters } from "./project.types";

interface WorkspaceFilterMenuProps {
    projects: ProjectFilterOption[];
    fileTypes: string[];
    value: WorkspaceFilters;
    onApply: (filters: WorkspaceFilters) => void;
    onReset: () => void;
    compact?: boolean;
}

const styles = StyleSheet.create({
    trigger: {
        minHeight: 42,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderRadius: radius.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        position: "relative",
        boxShadow: "0 8px 18px rgba(15, 23, 42, 0.16), inset 0 1px rgba(255,255,255,0.22)",
    },
    compactTrigger: {
        width: 42,
        paddingHorizontal: 0,
    },
    triggerText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },
    activeBadge: {
        position: "absolute",
        top: -7,
        right: -7,
        minWidth: 20,
        height: 20,
        paddingHorizontal: 5,
        borderRadius: radius.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: semanticColors.error,
        borderWidth: 2,
        borderColor: semanticColors.onAccent,
        boxShadow: "0 4px 9px rgba(15,23,42,0.24)",
    },
    activeBadgeText: {
        color: semanticColors.onAccent,
        fontSize: 10,
        fontWeight: typography.fontWeight.bold,
    },
    pressed: { transform: "translateY(1px)", opacity: 0.88 },
    modal: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing.md,
    },
    backdrop: {
        position: "absolute",
        inset: 0,
        backgroundColor: semanticColors.glassBackdrop,
        backdropFilter: "blur(7px)",
    },
    panel: {
        width: "min(760px, 96vw)",
        maxHeight: "88vh",
        overflowY: "auto",
        padding: spacing.lg,
        borderWidth: 1,
        borderRadius: radius.lg,
        gap: spacing.sm,
        opacity: 0.96,
        backdropFilter: "blur(22px)",
        boxShadow: "0 28px 70px rgba(15,23,42,0.34), 0 8px 20px rgba(15,23,42,0.2), inset 0 1px rgba(255,255,255,0.38)",
    },
    heading: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.xs,
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
    },
    closeButton: {
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.pill,
    },
    label: {
        marginTop: spacing.xs,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },
    searchBox: {
        minHeight: 40,
        paddingHorizontal: spacing.sm,
        borderWidth: 1,
        borderRadius: radius.md,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
    },
    input: {
        flex: 1,
        minWidth: 0,
        backgroundColor: "transparent",
        fontSize: typography.fontSize.sm,
    },
    table: {
        borderWidth: 1,
        borderRadius: radius.md,
        overflow: "hidden",
        maxHeight: 230,
        overflowY: "auto",
    },
    tableRow: {
        minHeight: 40,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(148,163,184,0.16)",
    },
    tableHeader: {
        position: "sticky",
        top: 0,
        zIndex: 1,
    },
    cell: {
        flex: 1,
        minWidth: 82,
        paddingHorizontal: spacing.xs,
        fontSize: typography.fontSize.xs,
        textAlign: "start",
    },
    headerCell: {
        fontWeight: typography.fontWeight.bold,
    },
    ltrCell: {
        direction: "ltr",
        textAlign: "left",
    },
    empty: {
        padding: spacing.md,
        textAlign: "center",
        fontSize: typography.fontSize.sm,
    },
    fileTypes: {
        minHeight: 42,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.xs,
    },
    fileType: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderWidth: 1,
        borderRadius: radius.pill,
    },
    actions: {
        marginTop: spacing.sm,
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: spacing.sm,
    },
    button: {
        minWidth: 96,
        minHeight: 40,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderRadius: radius.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        boxShadow: "0 7px 14px rgba(15,23,42,0.16), inset 0 1px rgba(255,255,255,0.22)",
    },
    buttonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
    },
});

export function WorkspaceFilterMenu({
    projects,
    fileTypes,
    value,
    onApply,
    onReset,
    compact = false,
}: WorkspaceFilterMenuProps) {
    const { direction, t, theme } = useSettings();
    const colors = theme.colors;
    const { isRtl } = getDirectionalLayout(direction);
    const [isOpen, setIsOpen] = useState(false);
    const [draft, setDraft] = useState(value);
    const [projectSearch, setProjectSearch] = useState("");
    const [fileTypeSearch, setFileTypeSearch] = useState("");
    const activeFilterCount = Number(Boolean(value.projectId)) + Number(Boolean(value.fileType));
    const hasFilters = activeFilterCount > 0;

    const visibleProjects = useMemo(() => {
        const query = projectSearch.trim().toLowerCase();
        if (!query) return projects;
        return projects.filter((project) =>
            [project.projectName, project.projectCode, project.contractNumber]
                .some((field) => field.toLowerCase().includes(query))
        );
    }, [projectSearch, projects]);

    const visibleFileTypes = useMemo(() => {
        const query = fileTypeSearch.trim().toLowerCase();
        return fileTypes.filter((fileType) => fileType.toLowerCase().includes(query));
    }, [fileTypeSearch, fileTypes]);

    function openMenu() {
        setDraft(value);
        setIsOpen(true);
    }

    function resetFilters() {
        setDraft(createDefaultWorkspaceFilters());
        setProjectSearch("");
        setFileTypeSearch("");
        onReset();
        setIsOpen(false);
    }

    function applyFilters() {
        onApply(draft);
        setIsOpen(false);
    }

    function searchField(
        searchValue: string,
        onChange: (nextValue: string) => void,
        placeholder: string,
    ) {
        return (
            <View
                style={[
                    styles.searchBox,
                    { borderColor: colors.border, backgroundColor: colors.background },
                ]}
            >
                <Feather name="search" size={15} color={semanticColors.muted} />
                <TextInput
                    value={searchValue}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor={semanticColors.muted}
                    style={[styles.input, { color: colors.text }]}
                />
            </View>
        );
    }

    function actionButton(
        label: string,
        icon: string,
        onPress: () => void,
        primary = false,
    ) {
        const foreground = primary ? colors.surface : colors.text;
        const background = primary ? colors.primary : colors.background;
        const border = primary ? colors.primary : colors.border;

        return (
            <Pressable
                onPress={onPress}
                style={[styles.button, { color: foreground, backgroundColor: background, borderColor: border }]}
            >
                <Feather name={icon} size={15} color={foreground} />
                <Text style={[styles.buttonText, { color: foreground }]}>{label}</Text>
            </Pressable>
        );
    }

    return (
        <>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("filters")}
                onPress={openMenu}
                style={({ pressed }) => [
                    styles.trigger,
                    compact && styles.compactTrigger,
                    {
                        backgroundColor: hasFilters ? colors.primary : colors.background,
                        borderColor: hasFilters ? colors.primary : colors.border,
                    },
                    pressed && styles.pressed,
                ]}
            >
                <Feather name="filter" size={16} color={hasFilters ? colors.surface : colors.text} />
                {!compact && (
                    <Text style={[styles.triggerText, { color: hasFilters ? colors.surface : colors.text }]}>
                        {t("filters")}
                    </Text>
                )}
                {hasFilters && (
                    <View
                        style={[
                            styles.activeBadge,
                            isRtl
                                ? { left: -7, right: undefined }
                                : { right: -7, left: undefined },
                        ]}
                    >
                        <Text style={styles.activeBadgeText}>{activeFilterCount}</Text>
                    </View>
                )}
            </Pressable>

            <Modal transparent visible={isOpen} animationType="fade">
                <View style={styles.modal}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("closeFilters")}
                        onPress={() => setIsOpen(false)}
                        style={styles.backdrop}
                    />
                    <View
                        style={[
                            styles.panel,
                            {
                                direction,
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <View style={styles.heading}>
                            <Text style={[styles.title, { color: colors.text }]}>{t("filters")}</Text>
                            <Pressable onPress={() => setIsOpen(false)} style={styles.closeButton}>
                                <Feather name="x" size={18} color={colors.text} />
                            </Pressable>
                        </View>
                        <Text style={[styles.label, { color: colors.text }]}>{t("projectFilter")}</Text>
                        {searchField(projectSearch, setProjectSearch, t("searchProjects"))}
                        <View style={[styles.table, { borderColor: colors.border }]}>
                            <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: colors.background }]}>
                                {[
                                    { label: t("row"), isLtr: false },
                                    { label: t("projectName"), isLtr: false },
                                    { label: t("projectCode"), isLtr: true },
                                    { label: t("contractNumber"), isLtr: true },
                                ].map(({ label, isLtr }) => (
                                    <Text
                                        key={label}
                                        style={[
                                            styles.cell,
                                            styles.headerCell,
                                            isLtr && styles.ltrCell,
                                            { color: colors.text },
                                        ]}
                                    >
                                        {label}
                                    </Text>
                                ))}
                            </View>
                            {visibleProjects.map((project, index) => {
                                const isSelected = draft.projectId === project.id;
                                return (
                                    <Pressable
                                        key={project.id}
                                        onPress={() => setDraft((current) => ({
                                            ...current,
                                            projectId: isSelected ? null : project.id,
                                        }))}
                                        style={[
                                            styles.tableRow,
                                            {
                                                backgroundColor: isSelected
                                                    ? semanticColors.selectedSurface
                                                    : "transparent",
                                            },
                                        ]}
                                    >
                                        {[
                                            { value: String(index + 1), isLtr: true },
                                            { value: project.projectName, isLtr: false },
                                            { value: project.projectCode, isLtr: true },
                                            { value: project.contractNumber, isLtr: true },
                                        ].map(({ value, isLtr }, cellIndex) => (
                                                <Text
                                                    key={cellIndex}
                                                    numberOfLines={1}
                                                    style={[
                                                        styles.cell,
                                                        isLtr && styles.ltrCell,
                                                        { color: colors.text },
                                                    ]}
                                                >
                                                    {value}
                                                </Text>
                                            ))}
                                    </Pressable>
                                );
                            })}
                            {visibleProjects.length === 0 && (
                                <Text style={[styles.empty, { color: semanticColors.muted }]}>
                                    {t("noProjectsFound")}
                                </Text>
                            )}
                        </View>

                        <Text style={[styles.label, { color: colors.text }]}>{t("fileTypeFilter")}</Text>
                        {searchField(fileTypeSearch, setFileTypeSearch, t("searchFileTypes"))}
                        <View style={styles.fileTypes}>
                            {visibleFileTypes.map((fileType) => {
                                const isSelected = draft.fileType === fileType;
                                return (
                                    <Pressable
                                        key={fileType}
                                        onPress={() => setDraft((current) => ({
                                            ...current,
                                            fileType: isSelected ? null : fileType,
                                        }))}
                                        style={[
                                            styles.fileType,
                                            {
                                                backgroundColor: isSelected ? colors.primary : colors.background,
                                                borderColor: isSelected ? colors.primary : colors.border,
                                            },
                                        ]}
                                    >
                                        <Text style={{ color: isSelected ? colors.surface : colors.text }}>
                                            {fileType.toUpperCase()}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <View style={styles.actions}>
                            {actionButton(t("reset"), "rotate-ccw", resetFilters)}
                            {actionButton(t("apply"), "check", applyFilters, true)}
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

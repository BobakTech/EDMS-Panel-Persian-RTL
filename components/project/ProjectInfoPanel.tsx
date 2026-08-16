/**
 * ============================================================================
 * Project Info Panel
 * ----------------------------------------------------------------------------
 * Shows active-project details in a compact collapsible sidebar panel.
 * ============================================================================
 */

import { useState } from "react";
import { Feather } from "../../web/icons";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "../../web/ui";

import type { ProjectInfo } from "./project.types";
import { radius, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

interface ProjectInfoPanelProps {
    projectInfo: ProjectInfo | null;
    isLoading: boolean;
    error?: string | null;
}

const panelColors = {
    border: "rgba(148, 163, 184, 0.22)",
    divider: "rgba(148, 163, 184, 0.14)",
    surface: "rgba(15, 23, 42, 0.34)",
    surfacePressed: "rgba(30, 41, 59, 0.52)",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
    accent: "#3B82F6",
};

function getReadableValue(value?: string | null) {
    return value && value.trim() !== "" ? value.trim() : "—";
}

function ProjectInfoValue({
    value,
    isLoading,
    color,
    numberOfLines = 1,
}: {
    value?: string | null;
    isLoading: boolean;
    color: string;
    numberOfLines?: number;
}) {
    if (isLoading) {
        return (
            <ActivityIndicator
                size="small"
                color={color}
                style={styles.spinner}
            />
        );
    }

    return (
        <Text numberOfLines={numberOfLines} style={[styles.value, { color }]}>
            {getReadableValue(value)}
        </Text>
    );
}

function ProjectInfoRow({
    label,
    value,
    isLoading,
    textColor,
    mutedColor,
}: {
    label: string;
    value?: string | null;
    isLoading: boolean;
    textColor: string;
    mutedColor: string;
}) {
    return (
        <View style={styles.row}>
            <Text style={[styles.label, { color: mutedColor }]}>{label}</Text>

            <ProjectInfoValue
                isLoading={isLoading}
                value={value}
                numberOfLines={2}
                color={textColor}
            />
        </View>
    );
}

export function ProjectInfoPanel({
    projectInfo,
    isLoading,
    error = null,
}: ProjectInfoPanelProps) {
    const { direction, t, theme } = useSettings();
    const colors = theme.colors;
    const [isExpanded, setIsExpanded] = useState(false);
    const statusLabel = isLoading
        ? t("projectConnectionConnecting")
        : error
            ? t("projectConnectionFailed")
            : t("projectConnectionConnected");
    const statusColor = isLoading
        ? "#F59E0B"
        : error
            ? "#94A3B8"
            : "#22C55E";

    return (
        <Pressable
            title={statusLabel}
            accessibilityRole="button"
            accessibilityLabel={statusLabel}
            accessibilityState={{ expanded: isExpanded }}
            onPress={() => setIsExpanded((currentValue) => !currentValue)}
            style={({ pressed }) => [
                styles.container,
                {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    height: isExpanded ? 154 : 50,
                    direction,
                },
                pressed && { opacity: 0.82 },
            ]}
        >
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <View style={styles.statusRow}>
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: statusColor },
                            ]}
                        />
                        <Text style={[styles.title, { color: colors.text }]}>
                            {statusLabel}
                        </Text>
                    </View>

                    <ProjectInfoValue
                        isLoading={isLoading}
                        value={projectInfo?.projectName}
                        color={colors.text}
                    />
                </View>

                <View
                    style={[
                        styles.toggleIcon,
                        {
                            backgroundColor: statusColor,
                        },
                    ]}
                >
                    <Feather
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={15}
                        color={colors.surface}
                    />
                </View>
            </View>

            {isExpanded ? (
                <View style={styles.details}>
                    <View
                        style={[
                            styles.divider,
                            { backgroundColor: colors.border },
                        ]}
                    />

                    <ProjectInfoRow
                        label={t("projectConnectionStatus")}
                        isLoading={false}
                        value={statusLabel}
                        textColor={statusColor}
                        mutedColor={panelColors.textMuted}
                    />

                    <ProjectInfoRow
                        label={t("projectName")}
                        isLoading={isLoading}
                        value={projectInfo?.projectName}
                        textColor={colors.text}
                        mutedColor={panelColors.textMuted}
                    />

                    <ProjectInfoRow
                        label={t("projectCode")}
                        isLoading={isLoading}
                        value={projectInfo?.projectCode}
                        textColor={colors.text}
                        mutedColor={panelColors.textMuted}
                    />
                </View>
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        flexGrow: 0,
        flexShrink: 0,
        alignSelf: "stretch",
        borderWidth: 1,
        borderColor: panelColors.border,
        borderRadius: radius.md,
        backgroundColor: panelColors.surface,
        overflow: "hidden",
    },
    header: {
        width: "100%",
        height: 50,
        alignSelf: "stretch",
        boxSizing: "border-box",
        flexGrow: 0,
        flexShrink: 0,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.xs,
    },
    headerText: {
        flex: 1,
        gap: 2,
    },
    title: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: panelColors.text,
        textAlign: "start",
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
    },
    statusDot: {
        width: 7,
        height: 7,
        borderRadius: radius.pill,
    },
    toggleIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        color: panelColors.accent,
        backgroundColor: "rgba(59, 130, 246, 0.12)",
    },
    details: {
        height: 104,
        paddingHorizontal: spacing.sm,
        paddingBottom: spacing.sm,
        gap: spacing.xs,
        flexGrow: 0,
        flexShrink: 0,
    },
    divider: {
        height: 1,
        backgroundColor: panelColors.divider,
        marginBottom: spacing.xs,
    },
    row: {
        minHeight: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
    },
    label: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        color: panelColors.textMuted,
        textAlign: "start",
    },
    value: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        color: panelColors.text,
        textAlign: "start",
        lineHeight: 18,
    },
    spinner: {
        alignSelf: "flex-end",
        minHeight: 18,
    },
});

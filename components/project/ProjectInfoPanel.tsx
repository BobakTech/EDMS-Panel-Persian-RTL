/**
 * ============================================================================
 * Project Info Panel
 * ----------------------------------------------------------------------------
 * Shows active-project details in a compact collapsible sidebar panel.
 * ============================================================================
 */

import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import type { ProjectInfo } from "./project.types";
import { radius, spacing, typography } from "../../theme";

interface ProjectInfoPanelProps {
    projectInfo: ProjectInfo | null;
    isLoading: boolean;
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
    numberOfLines = 1,
}: {
    value?: string | null;
    isLoading: boolean;
    numberOfLines?: number;
}) {
    if (isLoading) {
        return (
            <ActivityIndicator
                size="small"
                color={panelColors.accent}
                style={styles.spinner}
            />
        );
    }

    return (
        <Text numberOfLines={numberOfLines} style={styles.value}>
            {getReadableValue(value)}
        </Text>
    );
}

function ProjectInfoRow({
    label,
    value,
    isLoading,
}: {
    label: string;
    value?: string | null;
    isLoading: boolean;
}) {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>

            <ProjectInfoValue
                isLoading={isLoading}
                value={value}
                numberOfLines={2}
            />
        </View>
    );
}

export function ProjectInfoPanel({
    projectInfo,
    isLoading,
}: ProjectInfoPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <View style={styles.container}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Toggle active project details"
                onPress={() => setIsExpanded((currentValue) => !currentValue)}
                style={({ pressed }) => [
                    styles.header,
                    pressed && styles.headerPressed,
                ]}
            >
                <View style={styles.headerText}>
                    <Text style={styles.title}>Active Project</Text>

                    <ProjectInfoValue
                        isLoading={isLoading}
                        value={projectInfo?.projectCode}
                    />
                </View>

                <Text style={styles.toggleIcon}>
                    {isExpanded ? "−" : "+"}
                </Text>
            </Pressable>

            {isExpanded ? (
                <View style={styles.details}>
                    <View style={styles.divider} />

                    <ProjectInfoRow
                        label="Project Name"
                        isLoading={isLoading}
                        value={projectInfo?.projectName}
                    />

                    <ProjectInfoRow
                        label="Project Code"
                        isLoading={isLoading}
                        value={projectInfo?.projectCode}
                    />
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        borderWidth: 1,
        borderColor: panelColors.border,
        borderRadius: radius.md,
        backgroundColor: panelColors.surface,
        overflow: "hidden",
    },
    header: {
        minHeight: 44,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: spacing.xs,
    },
    headerPressed: {
        backgroundColor: panelColors.surfacePressed,
    },
    headerText: {
        flex: 1,
        gap: 2,
    },
    title: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        color: panelColors.text,
        textAlign: "left",
    },
    toggleIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        overflow: "hidden",
        textAlign: "center",
        lineHeight: 20,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
        color: panelColors.accent,
        backgroundColor: "rgba(59, 130, 246, 0.12)",
    },
    details: {
        paddingHorizontal: spacing.sm,
        paddingBottom: spacing.sm,
        gap: spacing.xs,
    },
    divider: {
        height: 1,
        backgroundColor: panelColors.divider,
        marginBottom: spacing.xs,
    },
    row: {
        gap: 2,
    },
    label: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        color: panelColors.textMuted,
        textAlign: "left",
    },
    value: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        color: panelColors.text,
        textAlign: "left",
        lineHeight: 18,
    },
    spinner: {
        alignSelf: "flex-start",
        minHeight: 18,
    },
});

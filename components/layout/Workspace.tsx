/**
 * ============================================================================
 * Workspace
 * ----------------------------------------------------------------------------
 * Displays the main content area of the application.
 * ============================================================================
 */

import { useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import { radius, shadows, spacing } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

import {
    WorkspaceBreadcrumb,
    WorkspaceEmptyState,
    WorkspaceHeader,
    WorkspaceItemCard,
    WorkspaceViewControls,
    workspaceItemsMock,
    type WorkspaceViewMode,
} from "../workspace";

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function Workspace() {
    const { theme } = useSettings();
    const colors = theme.colors;

    const { width } = useWindowDimensions();

    const isCompactWorkspace = width < spacing.sidebarWidth * 3;
    const workspacePadding = isCompactWorkspace
        ? spacing.lg
        : spacing.xl;

    const [viewMode, setViewMode] = useState<WorkspaceViewMode>("grid");

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const hasWorkspaceItems = workspaceItemsMock.length > 0;

    return (
        <View style={[
            styles.container,
            {
                padding: workspacePadding,
                backgroundColor: colors.background,
            },
        ]}>
            <View style={[
                styles.content,
                {
                    padding: workspacePadding,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                },
            ]}>
                {/* =========================================================================
                * Breadcrumb
                * ========================================================================= */}
                <WorkspaceBreadcrumb items={["خانه", "فضای کاری"]} />

                {/* =========================================================================
                * Workspace Header
                * ========================================================================= */}
                <WorkspaceHeader
                    title="فضای کاری"
                    subtitle="مدیریت پوشه‌ها، فایل‌ها و اسناد سازمانی"
                >
                    {/* View Controls */}
                    <WorkspaceViewControls
                        viewMode={viewMode}
                        onChangeViewMode={setViewMode}
                    />
                </WorkspaceHeader>

                {/* =========================================================================
                 * Workspace Content
                 * ========================================================================= */}
                <View style={styles.workspaceBody}>
                    {hasWorkspaceItems && (
                        <View style={
                            viewMode === "grid"
                                ? styles.workspaceGrid
                                : styles.workspaceList
                        }>
                            {workspaceItemsMock.map((item) => (
                                <WorkspaceItemCard
                                    key={item.id}
                                    item={item}
                                    viewMode={viewMode}
                                    isCompact={isCompactWorkspace}
                                    isSelected={selectedItemId === item.id}
                                    onPress={setSelectedItemId}
                                />
                            ))}
                        </View>
                    )}

                    {!hasWorkspaceItems && (
                        <WorkspaceEmptyState />
                    )}
                </View>
            </View>
        </View>
    );
}

/**
 * ============================================================================
 * Styles
 * ============================================================================
 */

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        flex: 1,

        borderWidth: 1,
        borderRadius: radius.xl,

        ...shadows.sm,
    },

    workspaceBody: {
        flex: 1,
    },

    workspaceGrid: {
        flexDirection: "row-reverse",
        flexWrap: "wrap",
        alignItems: "flex-start",

        gap: spacing.lg,
    },

    workspaceList: {
        flexDirection: "column",
        alignItems: "stretch",

        gap: spacing.md,
    },
});
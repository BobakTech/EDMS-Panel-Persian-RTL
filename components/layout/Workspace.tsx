/**
 * ============================================================================
 * Workspace
 * ----------------------------------------------------------------------------
 * Displays the main content area of the application.
 * ============================================================================
 */

import { useEffect, useState } from "react";
import {
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";

import { radius, shadows, spacing } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

import {
    WorkspaceBreadcrumb,
    WorkspaceEmptyState,
    WorkspaceHeader,
    WorkspaceItemCard,
    WorkspaceViewControls,
    WorkspaceItemDetailsPanel,
    type WorkspaceItem,
    type WorkspaceViewMode,
} from "../workspace";

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface WorkspaceProps {
    workspaceItems: WorkspaceItem[];
    searchQuery: string;
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function Workspace({
    workspaceItems,
    searchQuery,
}: WorkspaceProps) {
    const { theme } = useSettings();
    const colors = theme.colors;

    const { width } = useWindowDimensions();

    const isCompactWorkspace = width < spacing.sidebarWidth * 3;
    const workspacePadding = isCompactWorkspace
        ? spacing.lg
        : spacing.xl;
    const workspaceTopPadding = spacing.none;

    const [viewMode, setViewMode] = useState<WorkspaceViewMode>("grid");

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    useEffect(() => {
        setSelectedItemId(null);
    }, [workspaceItems]);

    function handlePressWorkspaceItem(itemId: string) {
        setSelectedItemId((currentItemId) =>
            currentItemId === itemId
                ? null
                : itemId
        );
    }

    function handleCloseWorkspaceItemDetails() {
        setSelectedItemId(null);
    }

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const visibleWorkspaceItems = normalizedSearchQuery
        ? workspaceItems.filter((item) =>
            item.name.toLowerCase().includes(normalizedSearchQuery) ||
            item.description.toLowerCase().includes(normalizedSearchQuery)
        )
        : workspaceItems;

    const selectedWorkspaceItem = workspaceItems.find(
        (item) => item.id === selectedItemId
    );

    const isLoadingWorkspaceItems = false;
    const workspaceErrorMessage: string | null = null;

    const hasWorkspaceItems = visibleWorkspaceItems.length > 0;
    const hasWorkspaceItemsError = workspaceErrorMessage !== null;

    const shouldShowLoadingState = isLoadingWorkspaceItems;
    const shouldShowErrorState = !isLoadingWorkspaceItems && hasWorkspaceItemsError;

    const shouldShowWorkspaceItems =
        !isLoadingWorkspaceItems &&
        !hasWorkspaceItemsError &&
        hasWorkspaceItems;

    const shouldShowEmptyState =
        !isLoadingWorkspaceItems &&
        !hasWorkspaceItemsError &&
        !hasWorkspaceItems;

    return (
        <View style={[
            styles.container,
            {
                paddingHorizontal: workspacePadding,
                paddingTop: workspaceTopPadding,
                paddingBottom: workspacePadding,
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

                {selectedWorkspaceItem && (
                    <WorkspaceItemDetailsPanel
                        item={selectedWorkspaceItem}
                        onClose={handleCloseWorkspaceItemDetails}
                    />
                )}

                {/* =========================================================================
                 * Workspace Content
                 * ========================================================================= */}
                <View style={styles.workspaceBody}>
                    {shouldShowWorkspaceItems && (
                        <View style={
                            viewMode === "grid"
                                ? styles.workspaceGrid
                                : styles.workspaceList
                        }>
                            {visibleWorkspaceItems.map((item) => (
                                <WorkspaceItemCard
                                    key={item.id}
                                    item={item}
                                    viewMode={viewMode}
                                    isCompact={isCompactWorkspace}
                                    isSelected={selectedItemId === item.id}
                                    onPress={handlePressWorkspaceItem}
                                />
                            ))}
                        </View>
                    )}

                    {shouldShowLoadingState && (
                        <WorkspaceEmptyState
                            icon="..."
                            title="در حال بارگذاری اسناد"
                            description="لطفاً چند لحظه صبر کنید."
                        />
                    )}

                    {shouldShowErrorState && (
                        <WorkspaceEmptyState
                            icon="!"
                            title="خطا در دریافت اطلاعات"
                            description={workspaceErrorMessage ?? "لطفاً دوباره تلاش کنید."}
                        />
                    )}

                    {shouldShowEmptyState && (
                        <WorkspaceEmptyState
                            icon={normalizedSearchQuery ? "?" : "+"}
                            title={
                                normalizedSearchQuery
                                    ? "نتیجه‌ای پیدا نشد"
                                    : "هنوز سندی وجود ندارد"
                            }
                            description={
                                normalizedSearchQuery
                                    ? "عبارت جستجو را تغییر دهید یا بعداً دوباره تلاش کنید."
                                    : "برای شروع، یک پوشه جدید بسازید یا فایل‌های خود را بارگذاری کنید."
                            }
                        />
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
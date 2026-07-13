/**
 * ============================================================================
 * Workspace
 * ----------------------------------------------------------------------------
 * Displays the main content area of the application.
 * ============================================================================
 */

import { useEffect, useRef, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";

import { radius, shadows, spacing, typography } from "../../theme";
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
 * Types
 * ============================================================================
 */

interface WorkspaceUndoToast {
    item: WorkspaceItem;
    message: string;
}

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface WorkspaceProps {
    workspaceItems: WorkspaceItem[];
    searchQuery: string;
    onArchiveItem: (itemId: string) => void;
    onMoveItemToTrash: (itemId: string) => void;
    onRestoreItem: (item: WorkspaceItem) => void;
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function Workspace({
    workspaceItems,
    searchQuery,
    onArchiveItem,
    onMoveItemToTrash,
    onRestoreItem,
}: WorkspaceProps) {
    const { theme } = useSettings();
    const colors = theme.colors;

    const dangerColor = "#DC2626";

    const { width } = useWindowDimensions();

    const isCompactWorkspace = width < spacing.sidebarWidth * 3;
    const workspacePadding = isCompactWorkspace
        ? spacing.lg
        : spacing.xl;
    const workspaceTopPadding = spacing.none;

    const [viewMode, setViewMode] = useState<WorkspaceViewMode>("grid");

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null);

    const [undoToast, setUndoToast] = useState<WorkspaceUndoToast | null>(null);
    const undoToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!selectedItemId) {
            return;
        }

        const selectedItemStillVisible = workspaceItems.some(
            (item) => item.id === selectedItemId && item.status !== "trashed"
        );

        if (!selectedItemStillVisible) {
            setSelectedItemId(null);
        }
    }, [selectedItemId, workspaceItems]);

    useEffect(() => {
        return () => {
            if (undoToastTimerRef.current) {
                clearTimeout(undoToastTimerRef.current);
            }
        };
    }, []);

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

    function handleRequestDeleteWorkspaceItem(itemId: string) {
        setPendingDeleteItemId(itemId);
    }

    function handleCancelDeleteWorkspaceItem() {
        setPendingDeleteItemId(null);
    }

    function showUndoToast(item: WorkspaceItem, message: string) {
        if (undoToastTimerRef.current) {
            clearTimeout(undoToastTimerRef.current);
        }

        setUndoToast({
            item,
            message,
        });

        undoToastTimerRef.current = setTimeout(() => {
            setUndoToast(null);
            undoToastTimerRef.current = null;
        }, 5000);
    }

    function handleUndoWorkspaceAction() {
        if (!undoToast) {
            return;
        }

        if (undoToastTimerRef.current) {
            clearTimeout(undoToastTimerRef.current);
            undoToastTimerRef.current = null;
        }

        onRestoreItem(undoToast.item);
        setUndoToast(null);
    }

    function handleArchivePendingWorkspaceItem() {
        if (!pendingDeleteWorkspaceItem) {
            return;
        }

        onArchiveItem(pendingDeleteWorkspaceItem.id);
        showUndoToast(pendingDeleteWorkspaceItem, "آیتم آرشیو شد.");
        setPendingDeleteItemId(null);
    }

    function handleMovePendingWorkspaceItemToTrash() {
        if (!pendingDeleteWorkspaceItem) {
            return;
        }

        onMoveItemToTrash(pendingDeleteWorkspaceItem.id);
        showUndoToast(pendingDeleteWorkspaceItem, "آیتم به سطل زباله منتقل شد.");
        setSelectedItemId(null);
        setPendingDeleteItemId(null);
    }

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const activeWorkspaceItems = workspaceItems.filter(
        (item) => item.status !== "trashed"
    );

    const visibleWorkspaceItems = normalizedSearchQuery
        ? activeWorkspaceItems.filter((item) =>
            item.name.toLowerCase().includes(normalizedSearchQuery) ||
            item.description.toLowerCase().includes(normalizedSearchQuery)
        )
        : activeWorkspaceItems;

    const selectedWorkspaceItem = visibleWorkspaceItems.find(
        (item) => item.id === selectedItemId
    );

    const pendingDeleteWorkspaceItem = visibleWorkspaceItems.find(
        (item) => item.id === pendingDeleteItemId
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
                        onRequestDelete={handleRequestDeleteWorkspaceItem}
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

            <Modal
                transparent
                visible={pendingDeleteItemId !== null}
                animationType="fade"
                onRequestClose={handleCancelDeleteWorkspaceItem}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={[
                            styles.modalCard,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.modalTitle,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            مدیریت آیتم انتخاب‌شده
                        </Text>

                        <Text
                            style={[
                                styles.modalDescription,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            می‌توانید این آیتم را به سطل زباله منتقل کنید، آن را آرشیو کنید، یا عملیات را لغو کنید.
                        </Text>

                        <View style={styles.modalActions}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="انتقال به سطل زباله"
                                onPress={handleMovePendingWorkspaceItemToTrash}
                                style={[
                                    styles.modalDangerButton,
                                    {
                                        backgroundColor: dangerColor,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.modalDangerButtonText,
                                        {
                                            color: colors.surface,
                                        },
                                    ]}
                                >
                                    انتقال به سطل زباله
                                </Text>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="آرشیو آیتم"
                                onPress={handleArchivePendingWorkspaceItem}
                                style={styles.modalCancelButton}
                            >
                                <Text
                                    style={[
                                        styles.modalSecondaryButtonText,
                                        {
                                            color: colors.primary,
                                        },
                                    ]}
                                >
                                    آرشیو
                                </Text>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="لغو عملیات"
                                onPress={handleCancelDeleteWorkspaceItem}
                                style={[
                                    styles.modalSecondaryButton,
                                    {
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.modalSecondaryButtonText,
                                        {
                                            color: colors.text,
                                        },
                                    ]}
                                >
                                    لغو
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {undoToast && (
                <View
                    style={[
                        styles.undoToast,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.undoToastText,
                            {
                                color: colors.text,
                            },
                        ]}
                    >
                        {undoToast.message}
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="بازگردانی عملیات"
                        onPress={handleUndoWorkspaceAction}
                        style={[
                            styles.undoToastButton,
                            {
                                borderColor: colors.primary,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.undoToastButtonText,
                                {
                                    color: colors.primary,
                                },
                            ]}
                        >
                            ↶ بازگردانی
                        </Text>
                    </Pressable>
                </View>
            )}
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

    modalOverlay: {
        flex: 1,

        alignItems: "center",
        justifyContent: "center",

        padding: spacing.xl,

        backgroundColor: "rgba(0, 0, 0, 0.28)",
    },

    modalCard: {
        width: "100%",
        maxWidth: 460,

        padding: spacing.lg,

        borderWidth: 1,
        borderRadius: radius.xl,

        ...shadows.md,
    },

    modalTitle: {
        marginBottom: spacing.sm,

        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    modalDescription: {
        marginBottom: spacing.lg,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        textAlign: "right",

        opacity: 0.72,
    },

    modalActions: {
        flexDirection: "row-reverse",
        alignItems: "center",
        flexWrap: "wrap",

        gap: spacing.sm,
    },

    modalCancelButton: {
        marginRight: spacing.lg,

        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },

    modalDangerButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,

        borderRadius: radius.md,
    },

    modalDangerButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    modalSecondaryButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.md,
    },

    modalSecondaryButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    undoToast: {
        position: "absolute",
        right: spacing.xl,
        bottom: spacing.xl,

        flexDirection: "row-reverse",
        alignItems: "center",

        maxWidth: 420,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.lg,

        gap: spacing.md,

        ...shadows.md,
    },

    undoToastText: {
        flex: 1,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        textAlign: "right",
    },

    undoToastButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,

        borderWidth: 1,
        borderRadius: radius.md,
    },

    undoToastButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },
});
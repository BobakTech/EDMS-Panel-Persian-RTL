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
    TextInput,
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
    type WorkspacePageType,
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

interface WorkspacePageContent {
    breadcrumbLabel: string;
    title: string;
    subtitle: string;
    emptyIcon: string;
    emptyTitle: string;
    emptyDescription: string;
    visibleStatus: WorkspaceItem["status"];
}

/**
 * ============================================================================
 * Helpers
 * ============================================================================
 */

function getWorkspacePageContent(pageType: WorkspacePageType): WorkspacePageContent {
    if (pageType === "archive") {
        return {
            breadcrumbLabel: "آرشیو",
            title: "آرشیو",
            subtitle: "مشاهده پوشه‌ها و فایل‌های آرشیو شده",
            emptyIcon: "A",
            emptyTitle: "آرشیوی وجود ندارد",
            emptyDescription: "فایل‌ها و پوشه‌هایی که آرشیو می‌شوند در این بخش نمایش داده خواهند شد.",
            visibleStatus: "archived",
        };
    }

    if (pageType === "trash") {
        return {
            breadcrumbLabel: "سطل زباله",
            title: "سطل زباله",
            subtitle: "مشاهده فایل‌ها و پوشه‌های حذف‌شده",
            emptyIcon: "T",
            emptyTitle: "سطل زباله خالی است",
            emptyDescription: "فایل‌ها و پوشه‌هایی که حذف می‌شوند در این بخش نمایش داده خواهند شد.",
            visibleStatus: "trashed",
        };
    }

    return {
        breadcrumbLabel: "فضای کاری",
        title: "فضای کاری",
        subtitle: "مدیریت پوشه‌ها، فایل‌ها و اسناد سازمانی",
        emptyIcon: "+",
        emptyTitle: "هنوز سندی وجود ندارد",
        emptyDescription: "برای شروع، یک پوشه جدید بسازید یا فایل‌های خود را بارگذاری کنید.",
        visibleStatus: "active",
    };
}

/**
 * ============================================================================
 * Workspace Item Visibility
 * ----------------------------------------------------------------------------
 * Page visibility is based on status. Folder filtering happens inside the
 * component because it depends on currentFolderId.
 * ============================================================================
 */

function isWorkspaceItemVisibleOnPage(
    item: WorkspaceItem,
    pageType: WorkspacePageType
) {
    return item.status === getWorkspacePageContent(pageType).visibleStatus;
}

/**
 * ============================================================================
 * Move Destinations
 * ============================================================================
 */

const MOVE_OUTSIDE_FOLDER_DESTINATION_ID = "__outside_folder__";
const MOVE_OUTSIDE_FOLDER_DESTINATION_LABEL = "خارج از پوشه";

/**
 * ============================================================================
 * Props
 * ============================================================================
 */

interface WorkspaceProps {
    pageType: WorkspacePageType;
    currentFolderId: string | null;
    workspaceItems: WorkspaceItem[];
    searchQuery: string;
    onChangeFolder: (folderId: string | null) => void;
    onArchiveItem: (itemId: string) => void;
    onMoveItemToTrash: (itemId: string) => void;
    onRestoreItem: (item: WorkspaceItem) => void;
    onRenameItem: (itemId: string, newName: string) => void;
    onDeleteItem: (itemId: string) => void;
    onMoveItem: (itemId: string, destinationFolderId: string | null) => void;
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function Workspace({
    pageType,
    currentFolderId,
    workspaceItems,
    searchQuery,
    onChangeFolder,
    onArchiveItem,
    onMoveItemToTrash,
    onRestoreItem,
    onRenameItem,
    onDeleteItem,
    onMoveItem,
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

    const pageContent = getWorkspacePageContent(pageType);

    const [viewMode, setViewMode] = useState<WorkspaceViewMode>("grid");

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null);

    const [pendingRenameItemId, setPendingRenameItemId] = useState<string | null>(null);
    const [renameItemName, setRenameItemName] = useState("");

    const [pendingMoveItemId, setPendingMoveItemId] = useState<string | null>(null);
    const [selectedDestinationFolderId, setSelectedDestinationFolderId] =
        useState<string | null>(null);
    const [moveSearchQuery, setMoveSearchQuery] = useState("");
    const [isMoveDestinationComboOpen, setIsMoveDestinationComboOpen] =
        useState(false);

    const [pendingPermanentDeleteItemId, setPendingPermanentDeleteItemId] =
        useState<string | null>(null);

    const [undoToast, setUndoToast] = useState<WorkspaceUndoToast | null>(null);
    const undoToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!selectedItemId) {
            return;
        }

        const selectedItemStillVisible = workspaceItems.some(
            (item) =>
                item.id === selectedItemId &&
                isWorkspaceItemVisibleOnPage(item, pageType)
        );

        if (!selectedItemStillVisible) {
            setSelectedItemId(null);
        }
    }, [pageType, selectedItemId, workspaceItems]);

    useEffect(() => {
        return () => {
            if (undoToastTimerRef.current) {
                clearTimeout(undoToastTimerRef.current);
            }
        };
    }, []);

    /**
     * ============================================================================
     * Current Folder Validation
     * ----------------------------------------------------------------------------
     * Returns to root if the opened folder is no longer available.
     * ============================================================================
     */

    useEffect(() => {
        if (pageType !== "workspace") {
            if (currentFolderId !== null) {
                onChangeFolder(null);
            }

            return;
        }

        if (!currentFolderId) {
            return;
        }

        const currentFolderStillExists = workspaceItems.some(
            (item) =>
                item.id === currentFolderId &&
                item.type === "folder" &&
                item.status === "active"
        );

        if (!currentFolderStillExists) {
            onChangeFolder(null);
        }
    }, [currentFolderId, onChangeFolder, pageType, workspaceItems]);

    /**
     * ============================================================================
     * Open Folder Or Select Item
     * ----------------------------------------------------------------------------
     * Folder cards open the folder. File cards keep the existing details behavior.
     * ============================================================================
     */

    function handlePressWorkspaceItem(itemId: string) {
        const pressedItem = visibleWorkspaceItems.find(
            (item) => item.id === itemId
        );

        if (pageType === "workspace" && pressedItem?.type === "folder") {
            onChangeFolder(pressedItem.id);
            setSelectedItemId(null);

            return;
        }

        setSelectedItemId((currentItemId) =>
            currentItemId === itemId
                ? null
                : itemId
        );
    }

    function handleReturnToWorkspaceRoot() {
        onChangeFolder(null);
        setSelectedItemId(null);
    }

    function handleCloseWorkspaceItemDetails() {
        setSelectedItemId(null);
    }

    function handleRequestDeleteWorkspaceItem(itemId: string) {
        setPendingDeleteItemId(itemId);
    }

    function handleRequestRenameWorkspaceItem(itemId: string) {
        const itemToRename = visibleWorkspaceItems.find(
            (item) => item.id === itemId
        );

        if (!itemToRename) {
            return;
        }

        setPendingRenameItemId(itemToRename.id);
        setRenameItemName(itemToRename.name);
    }

    function handleCancelRenameWorkspaceItem() {
        setPendingRenameItemId(null);
        setRenameItemName("");
    }

    function handleSaveRenameWorkspaceItem() {
        if (!pendingRenameWorkspaceItem) {
            return;
        }

        const trimmedRenameItemName = renameItemName.trim();

        if (!trimmedRenameItemName) {
            return;
        }

        onRenameItem(pendingRenameWorkspaceItem.id, trimmedRenameItemName);
        setPendingRenameItemId(null);
        setRenameItemName("");
    }

    function handleRequestMoveWorkspaceItem(itemId: string) {
        const itemToMove = workspaceItems.find((item) => item.id === itemId);

        setPendingMoveItemId(itemId);
        setSelectedDestinationFolderId(
            itemToMove?.parentFolderId ?? MOVE_OUTSIDE_FOLDER_DESTINATION_ID
        );
        setMoveSearchQuery("");
        setIsMoveDestinationComboOpen(false);
    }

    function handleCancelMoveWorkspaceItem() {
        setPendingMoveItemId(null);
        setSelectedDestinationFolderId(null);
        setMoveSearchQuery("");
        setIsMoveDestinationComboOpen(false);
    }

    function handleSaveMoveWorkspaceItem() {
        if (
            !pendingMoveWorkspaceItem ||
            selectedDestinationFolderId === null ||
            isMoveDestinationDisabled(selectedDestinationFolderId)
        ) {
            return;
        }

        const destinationFolderId =
            selectedDestinationFolderId === MOVE_OUTSIDE_FOLDER_DESTINATION_ID
                ? null
                : selectedDestinationFolderId;

        onMoveItem(pendingMoveWorkspaceItem.id, destinationFolderId);
        showUndoToast(pendingMoveWorkspaceItem, "آیتم منتقل شد.");
        setSelectedItemId(null);
        setPendingMoveItemId(null);
        setSelectedDestinationFolderId(null);
        setMoveSearchQuery("");
        setIsMoveDestinationComboOpen(false);
    }

    function handleRestoreArchivedWorkspaceItem(itemId: string) {
        const archivedItem = visibleWorkspaceItems.find(
            (item) => item.id === itemId
        );

        if (!archivedItem) {
            return;
        }

        onRestoreItem({
            ...archivedItem,
            status: "active",
            updatedAt: new Date().toISOString(),
        });

        showUndoToast(archivedItem, "آیتم به فضای کاری بازگردانده شد.");
        setSelectedItemId(null);
    }

    function handleMoveArchivedWorkspaceItemToTrash(itemId: string) {
        const archivedItem = visibleWorkspaceItems.find(
            (item) => item.id === itemId
        );

        if (!archivedItem) {
            return;
        }

        onMoveItemToTrash(archivedItem.id);
        showUndoToast(archivedItem, "آیتم به سطل زباله منتقل شد.");
        setSelectedItemId(null);
    }

    function handleRestoreTrashedWorkspaceItem(itemId: string) {
        const trashedItem = visibleWorkspaceItems.find(
            (item) => item.id === itemId
        );

        if (!trashedItem) {
            return;
        }

        onRestoreItem({
            ...trashedItem,
            status: "active",
            updatedAt: new Date().toISOString(),
        });

        showUndoToast(trashedItem, "آیتم از سطل زباله بازگردانده شد.");
        setSelectedItemId(null);
    }

    function handleRequestPermanentDeleteWorkspaceItem(itemId: string) {
        setPendingPermanentDeleteItemId(itemId);
    }

    function handleCancelPermanentDeleteWorkspaceItem() {
        setPendingPermanentDeleteItemId(null);
    }

    function handleConfirmPermanentDeleteWorkspaceItem() {
        if (!pendingPermanentDeleteWorkspaceItem) {
            return;
        }

        onDeleteItem(pendingPermanentDeleteWorkspaceItem.id);
        setSelectedItemId(null);
        setPendingPermanentDeleteItemId(null);
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

    const currentWorkspaceFolder = workspaceItems.find(
        (item) =>
            item.id === currentFolderId &&
            item.type === "folder" &&
            item.status === "active"
    );

    const pageWorkspaceItems = workspaceItems.filter((item) => {
        if (!isWorkspaceItemVisibleOnPage(item, pageType)) {
            return false;
        }

        if (pageType !== "workspace") {
            return true;
        }

        return (item.parentFolderId ?? null) === currentFolderId;
    });

    const visibleWorkspaceItems = normalizedSearchQuery
        ? pageWorkspaceItems.filter((item) =>
            item.name.toLowerCase().includes(normalizedSearchQuery) ||
            item.description.toLowerCase().includes(normalizedSearchQuery)
        )
        : pageWorkspaceItems;

    const selectedWorkspaceItem = visibleWorkspaceItems.find(
        (item) => item.id === selectedItemId
    );

    const pendingDeleteWorkspaceItem = visibleWorkspaceItems.find(
        (item) => item.id === pendingDeleteItemId
    );

    const pendingRenameWorkspaceItem = visibleWorkspaceItems.find(
        (item) => item.id === pendingRenameItemId
    );

    const pendingMoveWorkspaceItem = workspaceItems.find(
        (item) => item.id === pendingMoveItemId
    );

    const pendingPermanentDeleteWorkspaceItem = visibleWorkspaceItems.find(
        (item) => item.id === pendingPermanentDeleteItemId
    );

    const destinationFolders = workspaceItems.filter(
        (item) =>
            item.type === "folder" &&
            item.status === "active" &&
            item.id !== pendingMoveItemId
    );

    const currentMoveParentFolderId = pendingMoveWorkspaceItem?.parentFolderId ?? null;

    const normalizedMoveSearchQuery = moveSearchQuery.trim().toLowerCase();

    const isOutsideFolderDestinationVisible =
        !normalizedMoveSearchQuery ||
        MOVE_OUTSIDE_FOLDER_DESTINATION_LABEL.toLowerCase().includes(
            normalizedMoveSearchQuery
        );

    const filteredDestinationFolders = normalizedMoveSearchQuery
        ? destinationFolders.filter((folder) =>
            folder.name.toLowerCase().includes(normalizedMoveSearchQuery)
        )
        : destinationFolders;

    function getDestinationFolderId(destinationId: string) {
        return destinationId === MOVE_OUTSIDE_FOLDER_DESTINATION_ID
            ? null
            : destinationId;
    }

    function isMoveDestinationDisabled(destinationId: string) {
        return getDestinationFolderId(destinationId) === currentMoveParentFolderId;
    }

    const canSaveMoveWorkspaceItem =
        selectedDestinationFolderId !== null &&
        !isMoveDestinationDisabled(selectedDestinationFolderId);

    function getSelectedDestinationLabel() {
        if (selectedDestinationFolderId === MOVE_OUTSIDE_FOLDER_DESTINATION_ID) {
            return MOVE_OUTSIDE_FOLDER_DESTINATION_LABEL;
        }

        const selectedFolder = destinationFolders.find(
            (folder) => folder.id === selectedDestinationFolderId
        );

        return selectedFolder?.name ?? "انتخاب مقصد";
    }

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

    const detailsPrimaryAction =
        pageType === "archive"
            ? {
                label: "بازگردانی",
                icon: "↩",
                accessibilityLabel: "بازگردانی آیتم از آرشیو",
                onPress: handleRestoreArchivedWorkspaceItem,
            }
            : pageType === "trash"
                ? {
                    label: "بازگردانی",
                    icon: "↩",
                    accessibilityLabel: "بازگردانی آیتم از سطل زباله",
                    onPress: handleRestoreTrashedWorkspaceItem,
                }
                : {
                    label: "حذف / آرشیو",
                    icon: "⚠",
                    accessibilityLabel: "حذف یا آرشیو آیتم",
                    tone: "warning" as const,
                    onPress: handleRequestDeleteWorkspaceItem,
                };

    const detailsSecondaryAction =
        pageType === "archive"
            ? {
                label: "انتقال به سطل زباله",
                icon: "🗑",
                accessibilityLabel: "انتقال آیتم آرشیوی به سطل زباله",
                tone: "danger" as const,
                onPress: handleMoveArchivedWorkspaceItemToTrash,
            }
            : pageType === "workspace"
                ? {
                    label: "تغییر نام",
                    icon: "✎",
                    accessibilityLabel: "تغییر نام آیتم",
                    onPress: handleRequestRenameWorkspaceItem,
                }
                : pageType === "trash"
                    ? {
                        label: "حذف دائمی",
                        icon: "🗑",
                        accessibilityLabel: "حذف دائمی آیتم",
                        tone: "danger" as const,
                        onPress: handleRequestPermanentDeleteWorkspaceItem,
                    }
                    : undefined;

    const detailsTertiaryAction =
        pageType === "workspace"
            ? {
                label: "انتقال",
                icon: "⇄",
                accessibilityLabel: "انتقال آیتم",
                onPress: handleRequestMoveWorkspaceItem,
            }
            : undefined;

    /**
     * ============================================================================
     * Breadcrumb Items
     * ----------------------------------------------------------------------------
     * Keeps breadcrumb navigation available in both root and folder views.
     * ============================================================================
     */

    const breadcrumbItems = currentWorkspaceFolder
        ? [
            {
                label: "خانه",
                accessibilityLabel: "بازگشت به خانه",
                onPress: handleReturnToWorkspaceRoot,
            },
            {
                label: pageContent.breadcrumbLabel,
                accessibilityLabel: "بازگشت به فضای کاری",
                onPress: handleReturnToWorkspaceRoot,
            },
            {
                label: currentWorkspaceFolder.name,
            },
        ]
        : [
            {
                label: "خانه",
                accessibilityLabel: "رفتن به خانه",
                onPress: handleReturnToWorkspaceRoot,
            },
            {
                label: pageContent.breadcrumbLabel,
                accessibilityLabel: "رفتن به فضای کاری",
                onPress: handleReturnToWorkspaceRoot,
            },
        ];

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
                <View style={styles.workspaceTopBar}>
                    <WorkspaceBreadcrumb items={breadcrumbItems} />

                    {currentWorkspaceFolder && (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="بازگشت به فضای کاری"
                            onPress={handleReturnToWorkspaceRoot}
                            style={[
                                styles.folderBackButton,
                                {
                                    backgroundColor: colors.primary,
                                    borderColor: colors.primary,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.folderBackButtonText,
                                    {
                                        color: colors.surface,
                                    },
                                ]}
                            >
                                ↩ بازگشت
                            </Text>
                        </Pressable>
                    )}
                </View>

                <WorkspaceHeader
                    title={currentWorkspaceFolder?.name ?? pageContent.title}
                    subtitle={
                        currentWorkspaceFolder
                            ? "مشاهده فایل‌ها و پوشه‌های داخل این پوشه"
                            : pageContent.subtitle
                    }
                >
                    <WorkspaceViewControls
                        viewMode={viewMode}
                        onChangeViewMode={setViewMode}
                    />
                </WorkspaceHeader>

                {selectedWorkspaceItem && (
                    <WorkspaceItemDetailsPanel
                        item={selectedWorkspaceItem}
                        primaryAction={detailsPrimaryAction}
                        secondaryAction={detailsSecondaryAction}
                        tertiaryAction={detailsTertiaryAction}
                        onClose={handleCloseWorkspaceItemDetails}
                    />
                )}

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
                            icon={normalizedSearchQuery ? "?" : pageContent.emptyIcon}
                            title={
                                normalizedSearchQuery
                                    ? "نتیجه‌ای پیدا نشد"
                                    : currentWorkspaceFolder
                                        ? "این پوشه خالی است"
                                        : pageContent.emptyTitle
                            }
                            description={
                                normalizedSearchQuery
                                    ? "عبارت جستجو را تغییر دهید یا بعداً دوباره تلاش کنید."
                                    : currentWorkspaceFolder
                                        ? "برای افزودن فایل یا پوشه به این بخش، از دکمه‌های بالای صفحه استفاده کنید."
                                        : pageContent.emptyDescription
                            }
                        />
                    )}
                </View>
            </View>

            <Modal
                transparent
                visible={pageType === "workspace" && pendingDeleteItemId !== null}
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
                                style={styles.modalTextButton}
                            >
                                <Text
                                    style={[
                                        styles.modalTextButtonText,
                                        {
                                            color: colors.primary,
                                        },
                                    ]}
                                >
                                    آرشیو
                                </Text>
                            </Pressable>

                            <View style={styles.modalActionSpacer} />

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="لغو عملیات"
                                onPress={handleCancelDeleteWorkspaceItem}
                                style={styles.modalTextButton}
                            >
                                <Text
                                    style={[
                                        styles.modalTextButtonText,
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

            <Modal
                transparent
                visible={pageType === "workspace" && pendingRenameItemId !== null}
                animationType="fade"
                onRequestClose={handleCancelRenameWorkspaceItem}
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
                            تغییر نام آیتم
                        </Text>

                        <TextInput
                            value={renameItemName}
                            onChangeText={setRenameItemName}
                            placeholder="نام جدید را وارد کنید"
                            placeholderTextColor={colors.border}
                            style={[
                                styles.renameInput,
                                {
                                    color: colors.text,
                                    borderColor: colors.border,
                                    backgroundColor: colors.background,
                                },
                            ]}
                        />

                        <View style={styles.modalActions}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="ذخیره نام جدید"
                                onPress={handleSaveRenameWorkspaceItem}
                                style={[
                                    styles.modalPrimaryButton,
                                    {
                                        backgroundColor: colors.primary,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.modalPrimaryButtonText,
                                        {
                                            color: colors.surface,
                                        },
                                    ]}
                                >
                                    ذخیره
                                </Text>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="لغو تغییر نام"
                                onPress={handleCancelRenameWorkspaceItem}
                                style={styles.modalTextButton}
                            >
                                <Text
                                    style={[
                                        styles.modalTextButtonText,
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

            <Modal
                transparent
                visible={pageType === "workspace" && pendingMoveItemId !== null}
                animationType="fade"
                onRequestClose={handleCancelMoveWorkspaceItem}
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
                            انتقال آیتم
                        </Text>

                        <Text
                            style={[
                                styles.modalDescription,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            مقصد جدید آیتم را انتخاب کنید.
                        </Text>

                        <View style={styles.destinationCombo}>
                            <TextInput
                                value={
                                    isMoveDestinationComboOpen
                                        ? moveSearchQuery
                                        : getSelectedDestinationLabel()
                                }
                                onFocus={() => {
                                    setMoveSearchQuery("");
                                    setIsMoveDestinationComboOpen(true);
                                }}
                                onChangeText={(query) => {
                                    setMoveSearchQuery(query);
                                    setSelectedDestinationFolderId(null);
                                    setIsMoveDestinationComboOpen(true);
                                }}
                                placeholder="انتخاب مقصد..."
                                placeholderTextColor={colors.border}
                                style={[
                                    styles.destinationComboInput,
                                    {
                                        color: colors.text,
                                        borderColor: colors.border,
                                        backgroundColor: colors.background,
                                    },
                                ]}
                            />

                            {isMoveDestinationComboOpen && (
                                <View
                                    style={[
                                        styles.destinationDropdown,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                >
                                    {isOutsideFolderDestinationVisible && (
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="انتقال به خارج از پوشه"
                                            disabled={isMoveDestinationDisabled(
                                                MOVE_OUTSIDE_FOLDER_DESTINATION_ID
                                            )}
                                            onPress={() => {
                                                setSelectedDestinationFolderId(
                                                    MOVE_OUTSIDE_FOLDER_DESTINATION_ID
                                                );
                                                setMoveSearchQuery("");
                                                setIsMoveDestinationComboOpen(false);
                                            }}
                                            style={[
                                                styles.destinationOption,
                                                isMoveDestinationDisabled(
                                                    MOVE_OUTSIDE_FOLDER_DESTINATION_ID
                                                ) && styles.destinationOptionCurrentLocation,
                                                {
                                                    backgroundColor: isMoveDestinationDisabled(
                                                        MOVE_OUTSIDE_FOLDER_DESTINATION_ID
                                                    )
                                                        ? colors.background
                                                        : colors.surface,
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.destinationOptionText,
                                                    {
                                                        color: colors.text,
                                                    },
                                                ]}
                                            >
                                                {MOVE_OUTSIDE_FOLDER_DESTINATION_LABEL}
                                                {isMoveDestinationDisabled(
                                                    MOVE_OUTSIDE_FOLDER_DESTINATION_ID
                                                )
                                                    ? " — مکان فعلی"
                                                    : ""}
                                            </Text>
                                        </Pressable>
                                    )}

                                    {filteredDestinationFolders.map((folder) => {
                                        const isCurrentDestination =
                                            isMoveDestinationDisabled(folder.id);

                                        return (
                                            <Pressable
                                                key={folder.id}
                                                accessibilityRole="button"
                                                accessibilityLabel={`انتخاب پوشه ${folder.name}`}
                                                disabled={isCurrentDestination}
                                                onPress={() => {
                                                    setSelectedDestinationFolderId(folder.id);
                                                    setMoveSearchQuery("");
                                                    setIsMoveDestinationComboOpen(false);
                                                }}
                                                style={[
                                                    styles.destinationOption,
                                                    isCurrentDestination &&
                                                    styles.destinationOptionCurrentLocation,
                                                    {
                                                        backgroundColor: isCurrentDestination
                                                            ? colors.background
                                                            : colors.surface,
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.destinationOptionText,
                                                        {
                                                            color: colors.text,
                                                        },
                                                    ]}
                                                >
                                                    {folder.name}
                                                    {isCurrentDestination
                                                        ? " — مکان فعلی"
                                                        : ""}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}

                                    {!isOutsideFolderDestinationVisible &&
                                        filteredDestinationFolders.length === 0 && (
                                            <Text
                                                style={[
                                                    styles.destinationEmptyText,
                                                    {
                                                        color: colors.text,
                                                    },
                                                ]}
                                            >
                                                مقصدی پیدا نشد
                                            </Text>
                                        )}
                                </View>
                            )}
                        </View>

                        <View style={styles.modalActions}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="ذخیره انتقال آیتم"
                                disabled={!canSaveMoveWorkspaceItem}
                                onPress={handleSaveMoveWorkspaceItem}
                                style={[
                                    styles.modalPrimaryButton,
                                    {
                                        backgroundColor: canSaveMoveWorkspaceItem
                                            ? colors.primary
                                            : colors.border,
                                        opacity: canSaveMoveWorkspaceItem
                                            ? 1
                                            : 0.76,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.modalPrimaryButtonText,
                                        {
                                            color: colors.surface,
                                        },
                                    ]}
                                >
                                    انتقال
                                </Text>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="لغو انتقال آیتم"
                                onPress={handleCancelMoveWorkspaceItem}
                                style={styles.modalTextButton}
                            >
                                <Text
                                    style={[
                                        styles.modalTextButtonText,
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

            <Modal
                transparent
                visible={pageType === "trash" && pendingPermanentDeleteItemId !== null}
                animationType="fade"
                onRequestClose={handleCancelPermanentDeleteWorkspaceItem}
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
                            حذف دائمی آیتم
                        </Text>

                        <Text
                            style={[
                                styles.modalDescription,
                                {
                                    color: colors.text,
                                },
                            ]}
                        >
                            این آیتم به‌صورت دائمی حذف می‌شود و امکان بازگردانی آن وجود ندارد.
                        </Text>

                        <View style={styles.modalActions}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="تأیید حذف دائمی"
                                onPress={handleConfirmPermanentDeleteWorkspaceItem}
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
                                    حذف دائمی
                                </Text>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="لغو حذف دائمی"
                                onPress={handleCancelPermanentDeleteWorkspaceItem}
                                style={styles.modalTextButton}
                            >
                                <Text
                                    style={[
                                        styles.modalTextButtonText,
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
        position: "relative",

        flex: 1,

        borderWidth: 1,
        borderRadius: radius.xl,

        ...shadows.sm,
    },

    workspaceTopBar: {
        minHeight: 44,

        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "space-between",

        marginBottom: spacing.md,
    },

    folderBackButton: {
        minWidth: 88,
        height: 40,

        alignItems: "center",
        justifyContent: "center",

        paddingHorizontal: spacing.md,

        borderWidth: 1,
        borderRadius: radius.md,

        ...shadows.sm,
    },

    folderBackButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
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

        gap: spacing.sm,
    },

    modalActionSpacer: {
        flex: 1,
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

    modalPrimaryButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,

        borderRadius: radius.md,
    },

    modalPrimaryButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    modalTextButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },

    modalTextButtonText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    renameInput: {
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.md,

        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.medium,
        textAlign: "right",
    },

    destinationCombo: {
        position: "relative",

        marginBottom: spacing.lg,
    },

    destinationComboInput: {
        minHeight: 40,

        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.md,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        textAlign: "right",
    },

    destinationDropdown: {
        marginTop: spacing.xs,

        borderWidth: 1,
        borderRadius: radius.md,

        overflow: "hidden",
    },

    destinationOption: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },

    destinationOptionCurrentLocation: {
        opacity: 0.78,
    },

    destinationOptionText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "right",
    },

    destinationEmptyText: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,

        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        textAlign: "right",

        opacity: 0.72,
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

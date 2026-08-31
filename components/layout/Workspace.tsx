/**
 * ============================================================================
 * Workspace
 * ----------------------------------------------------------------------------
 * Displays the main content area of the application.
 * ============================================================================
 */

/**
 * ============================================================================
 * React Imports
 * ----------------------------------------------------------------------------
 * Workspace uses state, effects, refs, and fragments for inline preview rows.
 * ============================================================================
 */

import {
    Fragment,
    useEffect,
    useRef,
    useState,
} from "react";

import { Feather } from "../../web/icons";

import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "../../web/ui";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";
import type { TranslationKey } from "../../locales";

/**
 * ============================================================================
 * Workspace Component Imports
 * ----------------------------------------------------------------------------
 * Reusable workspace components used by the main workspace layout.
 * ============================================================================
 */

import {
    WorkspaceBreadcrumb,
    WorkspaceDocumentPreviewPanel,
    WorkspaceHeader,
    WorkspaceItemCard,
    WorkspaceItemDetailsPanel,
    WorkspaceViewControls,
} from "../workspace";
import {
    WorkspaceDeleteDialog,
    WorkspaceMoveDialog,
    WorkspacePermanentDeleteDialog,
    WorkspaceRenameDialog,
} from "../workspace/WorkspaceDialogs";

import WorkspaceEmptyState, {
    type DroppedWorkspaceFile,
} from "../workspace/WorkspaceEmptyState";

import { filterWorkspaceByCategory } from "../workspace/workspace.categories";
import type { WorkspaceCategory } from "../workspace/workspace.types";

/**
 * ============================================================================
 * Workspace Type Imports
 * ----------------------------------------------------------------------------
 * Shared workspace types used by layout state, props, and helpers.
 * ============================================================================
 */

import type {
    WorkspaceItem,
    WorkspacePageType,
    WorkspaceViewMode,
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

type Translate = (key: TranslationKey) => string;

function getWorkspacePageContent(pageType: WorkspacePageType, t: Translate): WorkspacePageContent {
    if (pageType === "archive") {
        return {
            breadcrumbLabel: t("archive"),
            title: t("archive"),
            subtitle: t("archiveSubtitle"),
            emptyIcon: "A",
            emptyTitle: t("emptyArchiveTitle"),
            emptyDescription: t("emptyArchiveDescription"),
            visibleStatus: "archived",
        };
    }

    if (pageType === "trash") {
        return {
            breadcrumbLabel: t("trash"),
            title: t("trash"),
            subtitle: t("trashSubtitle"),
            emptyIcon: "T",
            emptyTitle: t("emptyTrashTitle"),
            emptyDescription: t("emptyTrashDescription"),
            visibleStatus: "trashed",
        };
    }

    return {
        breadcrumbLabel: t("myDocuments"),
        title: t("workspace"),
        subtitle: t("workspaceSubtitle"),
        emptyIcon: "+",
        emptyTitle: t("emptyWorkspaceTitle"),
        emptyDescription: t("emptyWorkspaceDescription"),
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
    const visibleStatus = pageType === "archive"
        ? "archived"
        : pageType === "trash"
            ? "trashed"
            : "active";

    return item.status === visibleStatus;
}

/**
 * ============================================================================
 * Move Destinations
 * ============================================================================
 */

const MOVE_OUTSIDE_FOLDER_DESTINATION_ID = "__outside_folder__";

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
    onPressCreateFolder: () => void;
    onPressUpload: () => void;
    onArchiveItem: (itemId: string) => void;
    onMoveItemToTrash: (itemId: string) => void;
    onRestoreItem: (item: WorkspaceItem) => void;
    onRenameItem: (itemId: string, newName: string) => void;
    onDeleteItem: (itemId: string) => void;
    onMoveItem: (itemId: string, destinationFolderId: string | null) => void;
    onTogglePinnedItem: (itemId: string) => void;
    onOpenDashboard: () => void;
    onDropFiles: (files: DroppedWorkspaceFile[]) => void;
    onOpenPreviewPage: (item: WorkspaceItem) => void;
    workspaceCategories: WorkspaceCategory[];
    activeWorkspaceCategory: string;
    setActiveWorkspaceCategory: (categoryId: string) => void;
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
    onPressCreateFolder,
    onPressUpload,
    onArchiveItem,
    onMoveItemToTrash,
    onRestoreItem,
    onRenameItem,
    onDeleteItem,
    onMoveItem,
    onTogglePinnedItem,
    onOpenDashboard,
    onDropFiles,
    onOpenPreviewPage,
    workspaceCategories,
    activeWorkspaceCategory,
    setActiveWorkspaceCategory,
}: WorkspaceProps) {
    const { direction, t, theme } = useSettings();
    const colors = theme.colors;
    const { textAlign } = getDirectionalLayout(direction);

    const { width } = useWindowDimensions();

    const isPhoneWorkspace = width < 430;
    const isCompactWorkspace = width < 920;

    const workspaceGridColumnCount =
        isPhoneWorkspace
            ? 2
            : isCompactWorkspace
                ? 3
                : 5;

    const workspacePadding = isPhoneWorkspace
        ? spacing.sm
        : isCompactWorkspace
            ? spacing.lg
            : spacing.xl;

    const pageContent = getWorkspacePageContent(pageType, t);

    const workspaceFolders = workspaceItems.filter(
        (item) => item.type === "folder"
    );

    const currentWorkspaceFolder =
        currentFolderId
            ? workspaceFolders.find((item) => item.id === currentFolderId) ?? null
            : null;

    const currentFolderPath: WorkspaceItem[] = [];
    let folderWalker = currentWorkspaceFolder;

    while (folderWalker) {
        currentFolderPath.unshift(folderWalker);

        folderWalker = folderWalker.parentFolderId
            ? workspaceFolders.find((item) => item.id === folderWalker?.parentFolderId) ?? null
            : null;
    }

    const [viewMode, setViewMode] = useState<WorkspaceViewMode>("grid");

    const WORKSPACE_PAGE_SIZE_OPTIONS = [25, 50, 100, 200];
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null);

    /**
     * Tracks the file currently opened in the document preview panel.
     */
    const [previewItemId, setPreviewItemId] = useState<string | null>(null);

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
     * Press Workspace Item
     * ----------------------------------------------------------------------------
     * Opens folders normally and opens files in the document preview panel.
     * ============================================================================
     */

    function handlePressWorkspaceItem(itemId: string) {
        const pressedItem = visibleWorkspaceItems.find(
            (item) => item.id === itemId
        );

        if (pageType === "workspace" && pressedItem?.type === "folder") {
            onChangeFolder(pressedItem.id);
            setSelectedItemId(null);
            setPreviewItemId(null);

            return;
        }

        if (pressedItem?.type === "file") {
            setSelectedItemId(null);

            setPreviewItemId((currentPreviewItemId) =>
                currentPreviewItemId === itemId ? null : itemId
            );

            return;
        }

        setPreviewItemId(null);

        setSelectedItemId((currentItemId) =>
            currentItemId === itemId
                ? null
                : itemId
        );
    }

    /**
     * ============================================================================
     * Toggle Workspace Item Actions
     * ----------------------------------------------------------------------------
     * Opens item details/actions and closes the document preview panel.
     * ============================================================================
     */

    function handleOpenWorkspaceItemActions(itemId: string) {
        setPreviewItemId(null);

        setSelectedItemId((currentSelectedItemId) =>
            currentSelectedItemId === itemId ? null : itemId
        );
    }

    function handlePressEmptyStateCreateFolder() {
        onPressCreateFolder();
    }

    function handlePressEmptyStateUploadFile() {
        onPressUpload();
    }

    function handleDropFilesInEmptyState(files: DroppedWorkspaceFile[]) {
        onDropFiles(files);
    }

    function handleReturnToWorkspaceRoot() {
        onChangeFolder(null);
    }

    function handleReturnToPreviousFolder() {
        if (!currentWorkspaceFolder) {
            onChangeFolder(null);
            return;
        }

        onChangeFolder(currentWorkspaceFolder.parentFolderId ?? null);
    }

    function handleCloseWorkspaceItemDetails() {
        setSelectedItemId(null);
    }

    /**
     * ============================================================================
     * Close Document Preview
     * ----------------------------------------------------------------------------
     * Closes the selected file preview panel.
     * ============================================================================
     */

    function handleCloseDocumentPreview() {
        setPreviewItemId(null);
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
        showUndoToast(pendingMoveWorkspaceItem, t("itemMoved"));
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

        showUndoToast(archivedItem, t("itemRestoredToWorkspace"));
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
        showUndoToast(archivedItem, t("itemMovedToTrash"));
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

        showUndoToast(trashedItem, t("itemRestoredFromTrash"));
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
        showUndoToast(pendingDeleteWorkspaceItem, t("itemArchived"));
        setPendingDeleteItemId(null);
    }

    function handleMovePendingWorkspaceItemToTrash() {
        if (!pendingDeleteWorkspaceItem) {
            return;
        }

        onMoveItemToTrash(pendingDeleteWorkspaceItem.id);
        showUndoToast(pendingDeleteWorkspaceItem, t("itemMovedToTrash"));
        setSelectedItemId(null);
        setPendingDeleteItemId(null);
    }

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const pageWorkspaceItems = workspaceItems.filter((item) => {
        if (!isWorkspaceItemVisibleOnPage(item, pageType)) {
            return false;
        }

        if (pageType !== "workspace") {
            return true;
        }

        return (item.parentFolderId ?? null) === currentFolderId;
    });

    const filteredWorkspaceItems = normalizedSearchQuery
        ? pageWorkspaceItems.filter((item) =>
            item.name.toLowerCase().includes(normalizedSearchQuery) ||
            item.description.toLowerCase().includes(normalizedSearchQuery)
        )
        : pageWorkspaceItems;

    const categoryFilteredWorkspaceItems = filterWorkspaceByCategory(
        filteredWorkspaceItems,
        activeWorkspaceCategory
    );

    const visibleWorkspaceItems = [...categoryFilteredWorkspaceItems].sort(
        (firstItem, secondItem) =>
            Number(Boolean(secondItem.isPinned)) - Number(Boolean(firstItem.isPinned))
    );

    const totalWorkspaceItems = visibleWorkspaceItems.length;

    const totalWorkspacePages = Math.max(
        1,
        Math.ceil(totalWorkspaceItems / itemsPerPage)
    );

    const safeCurrentPage = Math.min(
        currentPage,
        totalWorkspacePages
    );

    const paginationStartIndex =
        (safeCurrentPage - 1) * itemsPerPage;

    const paginationEndIndex = Math.min(
        paginationStartIndex + itemsPerPage,
        totalWorkspaceItems
    );

    const paginatedWorkspaceItems = visibleWorkspaceItems.slice(
        paginationStartIndex,
        paginationEndIndex
    );

    const paginationWindowSize = 5;

    const paginationWindowStart = Math.max(
        1,
        Math.min(
            safeCurrentPage - Math.floor(paginationWindowSize / 2),
            totalWorkspacePages - paginationWindowSize + 1
        )
    );

    const paginationPageNumbers = Array.from(
        {
            length: Math.min(
                paginationWindowSize,
                totalWorkspacePages
            ),
        },
        (_, index) => Math.max(1, paginationWindowStart) + index
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [
        activeWorkspaceCategory,
        currentFolderId,
        normalizedSearchQuery,
        pageType,
        itemsPerPage,
    ]);

    const selectedWorkspaceItem = visibleWorkspaceItems.find(
        (item) => item.id === selectedItemId
    );

    const detailsPinAction =
        selectedWorkspaceItem
            ? {
                label: selectedWorkspaceItem.isPinned
                    ? t("unpinItem")
                    : t("pinItem"),
                icon: "pin",
                accessibilityLabel: selectedWorkspaceItem.isPinned
                    ? t("unpinItem")
                    : t("pinItem"),
                isActive: Boolean(selectedWorkspaceItem.isPinned),
                onPress: onTogglePinnedItem,
            }
            : undefined;

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
        t("outsideFolder").toLowerCase().includes(
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
            return t("outsideFolder");
        }

        const selectedFolder = destinationFolders.find(
            (folder) => folder.id === selectedDestinationFolderId
        );

        return selectedFolder?.name ?? t("selectDestination");
    }

    function handleFocusMoveDestination() {
        setMoveSearchQuery("");
        setIsMoveDestinationComboOpen(true);
    }

    function handleChangeMoveDestination(query: string) {
        setMoveSearchQuery(query);
        setSelectedDestinationFolderId(null);
        setIsMoveDestinationComboOpen(true);
    }

    function handleToggleMoveDestination() {
        setIsMoveDestinationComboOpen((currentValue) => !currentValue);
    }

    function handleSelectMoveDestination(destinationId: string) {
        setSelectedDestinationFolderId(destinationId);
        setMoveSearchQuery("");
        setIsMoveDestinationComboOpen(false);
    }

    function handleScrollWorkspaceToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
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

    const shouldShowEmptyStateActions =
        pageType === "workspace" && !normalizedSearchQuery;

    const detailsPrimaryAction =
        pageType === "archive"
            ? {
                label: t("restore"),
                icon: "↩",
                accessibilityLabel: t("restoreFromArchive"),
                onPress: handleRestoreArchivedWorkspaceItem,
            }
            : pageType === "trash"
                ? {
                    label: t("restore"),
                    icon: "↩",
                    accessibilityLabel: t("restoreFromTrash"),
                    onPress: handleRestoreTrashedWorkspaceItem,
                }
                : {
                    label: t("deleteOrArchive"),
                    icon: "⚠",
                    accessibilityLabel: t("deleteOrArchiveItem"),
                    tone: "warning" as const,
                    onPress: handleRequestDeleteWorkspaceItem,
                };

    const detailsSecondaryAction =
        pageType === "archive"
            ? {
                label: t("moveToTrash"),
                icon: "🗑",
                accessibilityLabel: t("moveArchivedToTrash"),
                tone: "danger" as const,
                onPress: handleMoveArchivedWorkspaceItemToTrash,
            }
            : pageType === "workspace"
                ? {
                    label: t("renameItem"),
                    icon: "✎",
                    accessibilityLabel: t("renameItem"),
                    onPress: handleRequestRenameWorkspaceItem,
                }
                : pageType === "trash"
                    ? {
                        label: t("permanentlyDeleteItem"),
                        icon: "🗑",
                        accessibilityLabel: t("permanentlyDeleteItem"),
                        tone: "danger" as const,
                        onPress: handleRequestPermanentDeleteWorkspaceItem,
                    }
                    : undefined;

    const detailsTertiaryAction =
        pageType === "workspace"
            ? {
                label: t("moveItem"),
                icon: "⇄",
                accessibilityLabel: t("moveItem"),
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

    const breadcrumbItems = [
        {
            label: t("home"),
            accessibilityLabel: "رفتن به داشبورد",
            onPress: onOpenDashboard,
        },
        {
            label: pageContent.breadcrumbLabel,
            accessibilityLabel: "بازگشت به ریشه اسناد",
            onPress: handleReturnToWorkspaceRoot,
        },
        ...currentFolderPath.map((folder, folderIndex) => {
            const isLastFolder = folderIndex === currentFolderPath.length - 1;

            return {
                label: folder.name,
                accessibilityLabel: `رفتن به ${folder.name}`,
                onPress: isLastFolder
                    ? undefined
                    : () => onChangeFolder(folder.id),
            };
        }),
    ];

    return (
        <View
            style={[
                styles.container,
                {
                    padding: workspacePadding,
                    backgroundColor: colors.background,
                },
            ]}
        >
            <View
                style={[
                    styles.content,
                    {
                        padding: workspacePadding,
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View style={styles.workspaceTopBar}>
                    <WorkspaceBreadcrumb items={breadcrumbItems} />

                    {currentWorkspaceFolder && (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={t("back")}
                            onPress={handleReturnToPreviousFolder}
                            style={({ pressed }) => [
                                styles.folderBackButton,
                                {
                                    backgroundColor: colors.primary,
                                    borderColor: colors.primary,
                                },
                                pressed && styles.pressedFolderBackButton,
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
                                ↩ {t("back")}
                            </Text>
                        </Pressable>
                    )}
                </View>

                <WorkspaceHeader
                    title={currentWorkspaceFolder?.name ?? pageContent.title}
                    subtitle={
                        currentWorkspaceFolder
                            ? t("folderContentsSubtitle")
                            : pageContent.subtitle
                    }
                >
                    <div
                        className="workspace-category-scrollbar"
                        style={{
                            width: "100%",
                            minWidth: 0,
                            overflowX: "auto",
                            overflowY: "hidden",
                            paddingBlock: 4,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                flexWrap: "nowrap",
                                alignItems: "center",
                                gap: 8,
                                width: "max-content",
                                minWidth: "100%",
                            }}
                        >
                            {workspaceCategories
                                .filter((category) => {
                                    const categoryCount =
                                        category.filesCount + category.foldersCount;

                                    return (
                                        category.id === "all" ||
                                        categoryCount > 0
                                    );
                                })
                                .map((category) => {
                                    const isActiveCategory =
                                        activeWorkspaceCategory === category.id;

                                    const categoryCount =
                                        category.filesCount +
                                        category.foldersCount;

                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            aria-pressed={isActiveCategory}
                                            onClick={() => {
                                                setSelectedItemId(null);
                                                setPreviewItemId(null);
                                                setActiveWorkspaceCategory(
                                                    category.id
                                                );
                                            }}
                                            style={{
                                                flexShrink: 0,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 7,

                                                minHeight: isPhoneWorkspace
                                                    ? 32
                                                    : 36,

                                                paddingInline:
                                                    isPhoneWorkspace
                                                        ? 11
                                                        : 14,

                                                paddingBlock: 6,

                                                border: `1px solid ${isActiveCategory
                                                    ? colors.primary
                                                    : colors.border
                                                    }`,

                                                borderRadius: 999,

                                                backgroundColor:
                                                    isActiveCategory
                                                        ? colors.primary
                                                        : colors.surface,

                                                color:
                                                    isActiveCategory
                                                        ? colors.surface
                                                        : colors.text,

                                                fontSize:
                                                    isPhoneWorkspace
                                                        ? 12
                                                        : 13,

                                                fontWeight:
                                                    isActiveCategory
                                                        ? 700
                                                        : 500,

                                                lineHeight: 1.2,
                                                whiteSpace: "nowrap",
                                                cursor: "pointer",

                                                transition:
                                                    "background-color 120ms ease, border-color 120ms ease, color 120ms ease",
                                            }}
                                        >
                                            <span>
                                                {category.id === "all"
                                                    ? direction === "rtl"
                                                        ? category.nameFa
                                                        : category.nameEn
                                                    : category.nameFa}
                                            </span>

                                            <span
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",

                                                    minWidth: 22,
                                                    height: 20,
                                                    paddingInline: 6,

                                                    borderRadius: 999,

                                                    backgroundColor:
                                                        isActiveCategory
                                                            ? "rgba(255,255,255,0.16)"
                                                            : "rgba(255,255,255,0.05)",

                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {categoryCount}
                                            </span>
                                        </button>
                                    );
                                })}
                        </div>
                    </div>

                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: isPhoneWorkspace
                                ? "wrap"
                                : "nowrap",

                            gap: 12,

                            paddingBlock: 10,
                            paddingInline: isPhoneWorkspace ? 0 : 2,

                            borderTop: `1px solid ${colors.border}`,
                            borderBottom: `1px solid ${colors.border}`,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                flexShrink: 0,
                            }}
                        >
                            <WorkspaceViewControls
                                viewMode={viewMode}
                                onChangeViewMode={setViewMode}
                            />
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",

                                justifyContent: isPhoneWorkspace
                                    ? "space-between"
                                    : "flex-end",

                                flexWrap: "wrap",
                                gap: 10,
                                minWidth: 0,
                                flex: 1,
                            }}
                        >
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    whiteSpace: "nowrap",

                                    fontSize: 12,
                                    color: colors.text,
                                    opacity: 0.78,
                                }}
                            >
                                <span>
                                    {totalWorkspaceItems === 0
                                        ? "0"
                                        : `${paginationStartIndex + 1}–${paginationEndIndex}`}
                                </span>

                                <span>/</span>

                                <strong
                                    style={{
                                        fontWeight: 700,
                                        opacity: 1,
                                    }}
                                >
                                    {totalWorkspaceItems}
                                </strong>
                            </div>

                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 7,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: colors.text,
                                        opacity: 0.72,
                                    }}
                                >
                                    {direction === "rtl"
                                        ? "تعداد نمایش"
                                        : "Items per page"}
                                </span>

                                <select
                                    value={itemsPerPage}
                                    onChange={(event) =>
                                        setItemsPerPage(
                                            Number(event.target.value)
                                        )
                                    }
                                    aria-label={
                                        direction === "rtl"
                                            ? "تعداد آیتم در هر صفحه"
                                            : "Items per page"
                                    }
                                    style={{
                                        height: 34,
                                        minWidth: 68,
                                        paddingInline: 10,

                                        border: `1px solid ${colors.border}`,
                                        borderRadius: 8,

                                        backgroundColor: colors.surface,
                                        color: colors.text,

                                        fontSize: 12,
                                        fontWeight: 600,

                                        cursor: "pointer",
                                        direction,
                                        outline: "none",
                                    }}
                                >
                                    {WORKSPACE_PAGE_SIZE_OPTIONS.map(
                                        (pageSize) => (
                                            <option
                                                key={pageSize}
                                                value={pageSize}
                                            >
                                                {pageSize}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {totalWorkspacePages > 1 && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 4,
                                        direction,
                                        flexShrink: 0,
                                    }}
                                >
                                    <button
                                        type="button"
                                        aria-label={
                                            direction === "rtl"
                                                ? "صفحه اول"
                                                : "First page"
                                        }
                                        disabled={safeCurrentPage <= 1}
                                        onClick={() => setCurrentPage(1)}
                                        style={{
                                            width: 32,
                                            height: 32,

                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",

                                            border: `1px solid ${colors.border}`,
                                            borderRadius: 8,

                                            backgroundColor: colors.surface,
                                            color: colors.text,

                                            fontSize: 16,

                                            cursor:
                                                safeCurrentPage <= 1
                                                    ? "default"
                                                    : "pointer",

                                            opacity:
                                                safeCurrentPage <= 1
                                                    ? 0.35
                                                    : 0.9,
                                        }}
                                    >
                                        «
                                    </button>

                                    <button
                                        type="button"
                                        aria-label={
                                            direction === "rtl"
                                                ? "صفحه قبل"
                                                : "Previous page"
                                        }
                                        disabled={safeCurrentPage <= 1}
                                        onClick={() =>
                                            setCurrentPage((page) =>
                                                Math.max(1, page - 1)
                                            )
                                        }
                                        style={{
                                            width: 32,
                                            height: 32,

                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",

                                            border: `1px solid ${colors.border}`,
                                            borderRadius: 8,

                                            backgroundColor: colors.surface,
                                            color: colors.text,

                                            fontSize: 16,

                                            cursor:
                                                safeCurrentPage <= 1
                                                    ? "default"
                                                    : "pointer",

                                            opacity:
                                                safeCurrentPage <= 1
                                                    ? 0.35
                                                    : 0.9,
                                        }}
                                    >
                                        ‹
                                    </button>

                                    {paginationPageNumbers.map(
                                        (pageNumber) => {
                                            const isActivePage =
                                                pageNumber ===
                                                safeCurrentPage;

                                            return (
                                                <button
                                                    key={pageNumber}
                                                    type="button"
                                                    aria-current={
                                                        isActivePage
                                                            ? "page"
                                                            : undefined
                                                    }
                                                    onClick={() =>
                                                        setCurrentPage(
                                                            pageNumber
                                                        )
                                                    }
                                                    style={{
                                                        minWidth: 32,
                                                        height: 32,
                                                        paddingInline: 8,

                                                        display:
                                                            "inline-flex",

                                                        alignItems:
                                                            "center",

                                                        justifyContent:
                                                            "center",

                                                        border: `1px solid ${isActivePage
                                                            ? colors.primary
                                                            : colors.border
                                                            }`,

                                                        borderRadius: 8,

                                                        backgroundColor:
                                                            isActivePage
                                                                ? colors.primary
                                                                : colors.surface,

                                                        color:
                                                            isActivePage
                                                                ? colors.surface
                                                                : colors.text,

                                                        fontSize: 12,

                                                        fontWeight:
                                                            isActivePage
                                                                ? 700
                                                                : 500,

                                                        cursor: "pointer",

                                                        boxShadow:
                                                            isActivePage
                                                                ? `0 0 0 2px ${colors.primary}22`
                                                                : "none",
                                                    }}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        }
                                    )}

                                    <button
                                        type="button"
                                        aria-label={
                                            direction === "rtl"
                                                ? "صفحه بعد"
                                                : "Next page"
                                        }
                                        disabled={
                                            safeCurrentPage >=
                                            totalWorkspacePages
                                        }
                                        onClick={() =>
                                            setCurrentPage((page) =>
                                                Math.min(
                                                    totalWorkspacePages,
                                                    page + 1
                                                )
                                            )
                                        }
                                        style={{
                                            width: 32,
                                            height: 32,

                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",

                                            border: `1px solid ${colors.border}`,
                                            borderRadius: 8,

                                            backgroundColor: colors.surface,
                                            color: colors.text,

                                            fontSize: 16,

                                            cursor:
                                                safeCurrentPage >=
                                                    totalWorkspacePages
                                                    ? "default"
                                                    : "pointer",

                                            opacity:
                                                safeCurrentPage >=
                                                    totalWorkspacePages
                                                    ? 0.35
                                                    : 0.9,
                                        }}
                                    >
                                        ›
                                    </button>

                                    <button
                                        type="button"
                                        aria-label={
                                            direction === "rtl"
                                                ? "صفحه آخر"
                                                : "Last page"
                                        }
                                        disabled={
                                            safeCurrentPage >=
                                            totalWorkspacePages
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                totalWorkspacePages
                                            )
                                        }
                                        style={{
                                            width: 32,
                                            height: 32,

                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",

                                            border: `1px solid ${colors.border}`,
                                            borderRadius: 8,

                                            backgroundColor: colors.surface,
                                            color: colors.text,

                                            fontSize: 16,

                                            cursor:
                                                safeCurrentPage >=
                                                    totalWorkspacePages
                                                    ? "default"
                                                    : "pointer",

                                            opacity:
                                                safeCurrentPage >=
                                                    totalWorkspacePages
                                                    ? 0.35
                                                    : 0.9,
                                        }}
                                    >
                                        »
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </WorkspaceHeader>

                <ScrollView
                    style={styles.workspaceBody}
                    contentContainerStyle={styles.workspaceBodyContent}
                    showsVerticalScrollIndicator
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {shouldShowWorkspaceItems && (
                        <View
                            style={
                                viewMode === "grid"
                                    ? [
                                        styles.workspaceGrid,
                                        isPhoneWorkspace &&
                                        styles.phoneWorkspaceGrid,
                                    ]
                                    : styles.workspaceList
                            }
                        >
                            {viewMode === "grid"
                                ? Array.from(
                                    {
                                        length: Math.ceil(
                                            paginatedWorkspaceItems.length /
                                            workspaceGridColumnCount
                                        ),
                                    },
                                    (_, rowIndex) => {
                                        const rowStartIndex =
                                            rowIndex *
                                            workspaceGridColumnCount;

                                        const rowItems =
                                            paginatedWorkspaceItems.slice(
                                                rowStartIndex,
                                                rowStartIndex +
                                                workspaceGridColumnCount
                                            );

                                        const selectedRowItem =
                                            rowItems.find(
                                                (item) =>
                                                    selectedItemId ===
                                                    item.id
                                            ) ?? null;

                                        const previewItem =
                                            rowItems.find(
                                                (item) =>
                                                    previewItemId ===
                                                    item.id &&
                                                    item.type === "file"
                                            ) ?? null;

                                        return (
                                            <Fragment
                                                key={`workspace-row-${rowIndex}`}
                                            >
                                                {selectedRowItem && (
                                                    <View
                                                        style={
                                                            styles.workspaceDetailsRow
                                                        }
                                                    >
                                                        <WorkspaceItemDetailsPanel
                                                            item={
                                                                selectedRowItem
                                                            }
                                                            primaryAction={
                                                                detailsPrimaryAction
                                                            }
                                                            secondaryAction={
                                                                detailsSecondaryAction
                                                            }
                                                            tertiaryAction={
                                                                detailsTertiaryAction
                                                            }
                                                            pinAction={
                                                                detailsPinAction
                                                            }
                                                            onClose={
                                                                handleCloseWorkspaceItemDetails
                                                            }
                                                        />
                                                    </View>
                                                )}

                                                <View
                                                    style={[
                                                        styles.workspaceGridRow,
                                                        isPhoneWorkspace && {
                                                            gap: spacing.sm,
                                                        },
                                                    ]}
                                                >
                                                    {rowItems.map(
                                                        (item) => {
                                                            const isPreviewOpen =
                                                                previewItemId ===
                                                                item.id &&
                                                                item.type ===
                                                                "file";

                                                            return (
                                                                <WorkspaceItemCard
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    item={
                                                                        item
                                                                    }
                                                                    viewMode={
                                                                        viewMode
                                                                    }
                                                                    isCompact={
                                                                        isCompactWorkspace
                                                                    }
                                                                    isSelected={
                                                                        selectedItemId ===
                                                                        item.id ||
                                                                        isPreviewOpen
                                                                    }
                                                                    onPress={
                                                                        handlePressWorkspaceItem
                                                                    }
                                                                    onOpenActions={
                                                                        handleOpenWorkspaceItemActions
                                                                    }
                                                                />
                                                            );
                                                        }
                                                    )}
                                                </View>

                                                {previewItem && (
                                                    <View
                                                        style={
                                                            styles.workspacePreviewRow
                                                        }
                                                    >
                                                        <WorkspaceDocumentPreviewPanel
                                                            item={
                                                                previewItem
                                                            }
                                                            onClose={
                                                                handleCloseDocumentPreview
                                                            }
                                                            onOpenFullPreview={
                                                                onOpenPreviewPage
                                                            }
                                                        />
                                                    </View>
                                                )}
                                            </Fragment>
                                        );
                                    }
                                )
                                : paginatedWorkspaceItems.map(
                                    (item) => {
                                        const isSelected =
                                            selectedItemId === item.id;

                                        const isPreviewOpen =
                                            previewItemId === item.id &&
                                            item.type === "file";

                                        return (
                                            <Fragment key={item.id}>
                                                {isSelected && (
                                                    <View
                                                        style={
                                                            styles.workspaceDetailsRow
                                                        }
                                                    >
                                                        <WorkspaceItemDetailsPanel
                                                            item={item}
                                                            primaryAction={
                                                                detailsPrimaryAction
                                                            }
                                                            secondaryAction={
                                                                detailsSecondaryAction
                                                            }
                                                            tertiaryAction={
                                                                detailsTertiaryAction
                                                            }
                                                            pinAction={
                                                                detailsPinAction
                                                            }
                                                            onClose={
                                                                handleCloseWorkspaceItemDetails
                                                            }
                                                        />
                                                    </View>
                                                )}

                                                <WorkspaceItemCard
                                                    item={item}
                                                    viewMode={viewMode}
                                                    isCompact={
                                                        isCompactWorkspace
                                                    }
                                                    isSelected={
                                                        isSelected ||
                                                        isPreviewOpen
                                                    }
                                                    onPress={
                                                        handlePressWorkspaceItem
                                                    }
                                                    onOpenActions={
                                                        handleOpenWorkspaceItemActions
                                                    }
                                                />

                                                {isPreviewOpen && (
                                                    <View
                                                        style={
                                                            styles.workspacePreviewRow
                                                        }
                                                    >
                                                        <WorkspaceDocumentPreviewPanel
                                                            item={item}
                                                            onClose={
                                                                handleCloseDocumentPreview
                                                            }
                                                            onOpenFullPreview={
                                                                onOpenPreviewPage
                                                            }
                                                        />
                                                    </View>
                                                )}
                                            </Fragment>
                                        );
                                    }
                                )}
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
                            description={
                                workspaceErrorMessage ??
                                "لطفاً دوباره تلاش کنید."
                            }
                        />
                    )}

                    {shouldShowEmptyState && (
                        <WorkspaceEmptyState
                            icon={
                                normalizedSearchQuery
                                    ? "?"
                                    : pageContent.emptyIcon
                            }
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
                                        ? "برای افزودن فایل یا پوشه به این بخش، از دکمه‌های پایین استفاده کنید."
                                        : pageContent.emptyDescription
                            }
                            showHints={false}
                            primaryActionLabel={
                                shouldShowEmptyStateActions
                                    ? "پوشه جدید"
                                    : undefined
                            }
                            secondaryActionLabel={
                                shouldShowEmptyStateActions
                                    ? "بارگذاری فایل"
                                    : undefined
                            }
                            onPrimaryActionPress={
                                shouldShowEmptyStateActions
                                    ? handlePressEmptyStateCreateFolder
                                    : undefined
                            }
                            onSecondaryActionPress={
                                shouldShowEmptyStateActions
                                    ? handlePressEmptyStateUploadFile
                                    : undefined
                            }
                            onFilesDrop={
                                shouldShowEmptyStateActions
                                    ? handleDropFilesInEmptyState
                                    : undefined
                            }
                        />
                    )}
                </ScrollView>

                <Pressable
                    title={
                        direction === "rtl"
                            ? "بازگشت به بالا"
                            : "Back to top"
                    }
                    accessibilityRole="button"
                    accessibilityLabel={
                        direction === "rtl"
                            ? "بازگشت به بالای فضای کاری"
                            : "Back to top of workspace"
                    }
                    onPress={handleScrollWorkspaceToTop}
                    style={({ pressed }) => [
                        styles.scrollToTopButton,
                        {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,

                            right:
                                direction === "ltr"
                                    ? spacing.xl
                                    : "auto",

                            left:
                                direction === "rtl"
                                    ? spacing.xl
                                    : "auto",
                        },
                        pressed &&
                        styles.pressedScrollToTopButton,
                    ]}
                >
                    <Feather
                        name="chevron-up"
                        size={20}
                        color="#ffffff"
                    />
                </Pressable>
            </View>

            <WorkspaceDeleteDialog
                visible={
                    pageType === "workspace" &&
                    pendingDeleteItemId !== null
                }
                onMoveToTrash={
                    handleMovePendingWorkspaceItemToTrash
                }
                onArchive={handleArchivePendingWorkspaceItem}
                onCancel={handleCancelDeleteWorkspaceItem}
            />

            <WorkspaceRenameDialog
                visible={
                    pageType === "workspace" &&
                    pendingRenameItemId !== null
                }
                value={renameItemName}
                onChange={setRenameItemName}
                onSave={handleSaveRenameWorkspaceItem}
                onCancel={handleCancelRenameWorkspaceItem}
            />

            <WorkspaceMoveDialog
                visible={
                    pageType === "workspace" &&
                    pendingMoveItemId !== null
                }
                value={
                    isMoveDestinationComboOpen
                        ? moveSearchQuery
                        : getSelectedDestinationLabel()
                }
                isOpen={isMoveDestinationComboOpen}
                destinationFolders={filteredDestinationFolders}
                outsideFolderDestinationId={
                    MOVE_OUTSIDE_FOLDER_DESTINATION_ID
                }
                isOutsideFolderVisible={
                    isOutsideFolderDestinationVisible
                }
                canSave={canSaveMoveWorkspaceItem}
                isDestinationDisabled={
                    isMoveDestinationDisabled
                }
                onFocus={handleFocusMoveDestination}
                onChange={handleChangeMoveDestination}
                onToggle={handleToggleMoveDestination}
                onSelectOutsideFolder={() =>
                    handleSelectMoveDestination(
                        MOVE_OUTSIDE_FOLDER_DESTINATION_ID
                    )
                }
                onSelectDestination={
                    handleSelectMoveDestination
                }
                onSave={handleSaveMoveWorkspaceItem}
                onCancel={handleCancelMoveWorkspaceItem}
            />

            <WorkspacePermanentDeleteDialog
                visible={
                    pageType === "trash" &&
                    pendingPermanentDeleteItemId !== null
                }
                onConfirm={
                    handleConfirmPermanentDeleteWorkspaceItem
                }
                onCancel={
                    handleCancelPermanentDeleteWorkspaceItem
                }
            />

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
                                textAlign,
                            },
                        ]}
                    >
                        {undoToast.message}
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t("undoAction")}
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
                            ↶ {t("undo")}
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
        minHeight: 36,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        marginBottom: spacing.sm,
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

    pressedFolderBackButton: {
        opacity: 0.82,
    },

    workspaceBody: {
        flexGrow: 0,
        flexShrink: 0,
        minHeight: 0,
        overflowY: "visible",
    },

    workspaceBodyContent: {
        flexGrow: 1,
    },

    workspaceGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "flex-start",

        width: "100%",

        gap: spacing.lg,
    },

    phoneWorkspaceGrid: {
        gap: spacing.sm,
    },

    workspaceList: {
        flexDirection: "column",
        alignItems: "stretch",

        gap: spacing.md,
    },

    /**
     * ============================================================================
     * Workspace Preview Row
     * ----------------------------------------------------------------------------
     * Makes the expanded preview span the workspace row instead of card width.
     * ============================================================================
     */

    workspacePreviewRow: {
        width: "100%",
        maxWidth: "100%",
        flexBasis: "100%",
    },

    workspaceDetailsRow: {
        width: "100%",
        maxWidth: "100%",
        flexBasis: "100%",
    },

    undoToast: {
        position: "absolute",
        right: spacing.xl,
        bottom: spacing.xl,

        flexDirection: "row",
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
        textAlign: "start",
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

    workspaceGridRow: {
        width: "100%",

        flexDirection: "row",
        flexWrap: "nowrap",
        alignItems: "flex-start",

        gap: spacing.lg,
    },

    scrollToTopButton: {
        position: "fixed",
        bottom: spacing.xl,
        zIndex: 20,

        width: 42,
        height: 42,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: radius.pill,

        ...shadows.md,
    },

    pressedScrollToTopButton: {
        opacity: 0.82,
    },
});

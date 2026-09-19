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
    View,
} from "../../web/ui";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";
import type { TranslationKey } from "../../locales";

import EdmsSelect from "../common/EdmsSelect";

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
    WorkspaceCategoryDefinition,
    WorkspaceItem,
    WorkspaceItemUpdate,
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
    onUpdateItem: (itemId: string, updates: WorkspaceItemUpdate) => void;
    onDeleteItem: (itemId: string) => void;
    onMoveItem: (itemId: string, destinationFolderId: string | null) => void;
    onTogglePinnedItem: (itemId: string) => void;
    onOpenDashboard: () => void;
    onDropFiles: (files: DroppedWorkspaceFile[]) => void;
    onOpenPreviewPage: (item: WorkspaceItem) => void;
    workspaceCategories: WorkspaceCategory[];
    workspaceCategoryDefinitions: WorkspaceCategoryDefinition[];
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
    onUpdateItem,
    onDeleteItem,
    onMoveItem,
    onTogglePinnedItem,
    onOpenDashboard,
    onDropFiles,
    onOpenPreviewPage,
    workspaceCategories,
    workspaceCategoryDefinitions,
    activeWorkspaceCategory,
    setActiveWorkspaceCategory,
}: WorkspaceProps) {
    const { direction, t, theme } = useSettings();
    const colors = theme.colors;
    const { textAlign } = getDirectionalLayout(direction);

    // The shell and Workspace must react to the same live browser viewport.
    const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
    const [contentWidth, setContentWidth] = useState<number | null>(null);

    useEffect(() => {
        const updateViewportWidth = () => setViewportWidth(window.innerWidth);
        window.addEventListener("resize", updateViewportWidth);
        updateViewportWidth();
        return () => window.removeEventListener("resize", updateViewportWidth);
    }, []);

    // Measure the real card container, including changes caused by sidebar layout.
    useEffect(() => {
        const element = document.querySelector<HTMLElement>(".edms-workspace-content");
        if (!element) return;

        const updateContentWidth = () => setContentWidth(element.clientWidth);
        const observer = new ResizeObserver(updateContentWidth);
        observer.observe(element);
        updateContentWidth();
        return () => observer.disconnect();
    }, []);

    const width = Math.min(viewportWidth, contentWidth ?? viewportWidth);
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

    /**
     * Workspace multi-selection is independent from preview/details selection.
     * Pagination only changes rendering; selected ids remain selected across pages.
     */
    const [multiSelectedItemIds, setMultiSelectedItemIds] = useState<string[]>([]);
    const [isBulkDeletePending, setIsBulkDeletePending] = useState(false);
    const [isBulkMovePending, setIsBulkMovePending] = useState(false);
    const [isBulkPermanentDeletePending, setIsBulkPermanentDeletePending] = useState(false);
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

    const [pendingPermanentDeleteItemId, setPendingPermanentDeleteItemId] =
        useState<string | null>(null);

    const [undoToast, setUndoToast] = useState<WorkspaceUndoToast | null>(null);
    const undoToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


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

    function handleToggleWorkspaceItemSelection(itemId: string) {
        setSelectedItemIdsSafe(itemId);
        setPreviewItemId(null);
    }

    function setSelectedItemIdsSafe(itemId: string) {
        setMultiSelectedItemIds((currentIds) =>
            currentIds.includes(itemId)
                ? currentIds.filter((id) => id !== itemId)
                : [...currentIds, itemId]
        );
    }

    function handleClearWorkspaceSelection() {
        setMultiSelectedItemIds([]);
    }

    function handlePressWorkspaceItem(itemId: string) {
        const pressedItem = visibleWorkspaceItems.find(
            (item) => item.id === itemId
        );

        if (pageType === "workspace" && pressedItem?.type === "folder") {
            onChangeFolder(pressedItem.id);
            setPreviewItemId(null);

            return;
        }

        if (pressedItem?.type === "file") {

            setPreviewItemId((currentPreviewItemId) =>
                currentPreviewItemId === itemId ? null : itemId
            );

            return;
        }

        setPreviewItemId(null);

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
    }

    function handleCancelMoveWorkspaceItem() {
        setPendingMoveItemId(null);
        setSelectedDestinationFolderId(null);
        setIsBulkMovePending(false);
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

        if (isBulkMovePending) {
            selectedWorkspaceItems.forEach((item) =>
                onMoveItem(item.id, destinationFolderId)
            );
            setMultiSelectedItemIds([]);
        } else {
            onMoveItem(pendingMoveWorkspaceItem.id, destinationFolderId);
            showUndoToast(pendingMoveWorkspaceItem, t("itemMoved"));
        }

        setPendingMoveItemId(null);
        setSelectedDestinationFolderId(null);
        setIsBulkMovePending(false);
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
    }

    function handleRequestPermanentDeleteWorkspaceItem(itemId: string) {
        setPendingPermanentDeleteItemId(itemId);
    }

    function handleCancelPermanentDeleteWorkspaceItem() {
        setPendingPermanentDeleteItemId(null);
        setIsBulkPermanentDeletePending(false);
    }

    function handleConfirmPermanentDeleteWorkspaceItem() {
        if (isBulkPermanentDeletePending) {
            selectedWorkspaceItems.forEach((item) => onDeleteItem(item.id));
            setMultiSelectedItemIds([]);
            setIsBulkPermanentDeletePending(false);
            return;
        }

        if (!pendingPermanentDeleteWorkspaceItem) {
            return;
        }

        onDeleteItem(pendingPermanentDeleteWorkspaceItem.id);
        setPendingPermanentDeleteItemId(null);
    }

    function handleCancelDeleteWorkspaceItem() {
        setPendingDeleteItemId(null);
        setIsBulkDeletePending(false);
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
        if (isBulkDeletePending) {
            selectedWorkspaceItems.forEach((item) => onArchiveItem(item.id));
            setMultiSelectedItemIds([]);
            setIsBulkDeletePending(false);
            return;
        }

        if (!pendingDeleteWorkspaceItem) {
            return;
        }

        onArchiveItem(pendingDeleteWorkspaceItem.id);
        showUndoToast(pendingDeleteWorkspaceItem, t("itemArchived"));
        setPendingDeleteItemId(null);
    }

    function handleMovePendingWorkspaceItemToTrash() {
        if (isBulkDeletePending) {
            selectedWorkspaceItems.forEach((item) => onMoveItemToTrash(item.id));
            setMultiSelectedItemIds([]);
            setIsBulkDeletePending(false);
            return;
        }

        if (!pendingDeleteWorkspaceItem) {
            return;
        }

        onMoveItemToTrash(pendingDeleteWorkspaceItem.id);
        showUndoToast(pendingDeleteWorkspaceItem, t("itemMovedToTrash"));
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

    const selectedWorkspaceItems = visibleWorkspaceItems.filter((item) =>
        multiSelectedItemIds.includes(item.id)
    );

    const selectedWorkspaceItemCount = selectedWorkspaceItems.length;

    const allSelectedWorkspaceItemsPinned =
        selectedWorkspaceItemCount > 0 &&
        selectedWorkspaceItems.every((item) => Boolean(item.isPinned));

    function handleBulkTogglePinnedWorkspaceItems() {
        const shouldPin = !allSelectedWorkspaceItemsPinned;

        selectedWorkspaceItems.forEach((item) => {
            if (Boolean(item.isPinned) !== shouldPin) {
                onTogglePinnedItem(item.id);
            }
        });
    }

    function handleRequestBulkDeleteWorkspaceItems() {
        if (selectedWorkspaceItemCount === 0) {
            return;
        }

        setIsBulkDeletePending(true);
    }

    function handleRequestBulkMoveWorkspaceItems() {
        if (selectedWorkspaceItemCount === 0) {
            return;
        }

        const firstSelectedItem = selectedWorkspaceItems[0];

        setPendingMoveItemId(firstSelectedItem.id);
        setSelectedDestinationFolderId(
            firstSelectedItem.parentFolderId ?? MOVE_OUTSIDE_FOLDER_DESTINATION_ID
        );
        setIsBulkMovePending(true);
    }

    function handleBulkRestoreWorkspaceItems() {
        selectedWorkspaceItems.forEach((item) => {
            onRestoreItem({
                ...item,
                status: "active",
                updatedAt: new Date().toISOString(),
            });
        });

        setMultiSelectedItemIds([]);
    }

    function handleBulkMoveWorkspaceItemsToTrash() {
        selectedWorkspaceItems.forEach((item) => onMoveItemToTrash(item.id));
        setMultiSelectedItemIds([]);
    }

    function handleRequestBulkPermanentDeleteWorkspaceItems() {
        if (selectedWorkspaceItemCount === 0) {
            return;
        }

        setIsBulkPermanentDeletePending(true);
    }

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

    const allPageWorkspaceItemsSelected =
        paginatedWorkspaceItems.length > 0 &&
        paginatedWorkspaceItems.every((item) =>
            multiSelectedItemIds.includes(item.id)
        );

    function handleSelectAllPageWorkspaceItems() {
        setMultiSelectedItemIds((currentIds) => {
            const nextIds = new Set(currentIds);
            paginatedWorkspaceItems.forEach((item) => nextIds.add(item.id));
            return Array.from(nextIds);
        });
        setPreviewItemId(null);
    }

    function handleDeselectAllPageWorkspaceItems() {
        const pageItemIds = new Set(paginatedWorkspaceItems.map((item) => item.id));
        setMultiSelectedItemIds((currentIds) => currentIds.filter((itemId) => !pageItemIds.has(itemId)));
    }

    function handleInvertPageWorkspaceSelection() {
        setMultiSelectedItemIds((currentIds) => {
            const nextIds = new Set(currentIds);
            paginatedWorkspaceItems.forEach((item) => {
                if (nextIds.has(item.id)) nextIds.delete(item.id);
                else nextIds.add(item.id);
            });
            return Array.from(nextIds);
        });
        setPreviewItemId(null);
    }

    const paginationWindowSize = isPhoneWorkspace ? 3 : 5;

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

    useEffect(() => {
        setMultiSelectedItemIds([]);
        setIsBulkDeletePending(false);
        setIsBulkMovePending(false);
        setIsBulkPermanentDeletePending(false);
    }, [
        activeWorkspaceCategory,
        currentFolderId,
        normalizedSearchQuery,
        pageType,
    ]);

    useEffect(() => {
        setMultiSelectedItemIds((currentIds) =>
            currentIds.filter((itemId) =>
                visibleWorkspaceItems.some((item) => item.id === itemId)
            )
        );
    }, [workspaceItems, pageType, currentFolderId, activeWorkspaceCategory, normalizedSearchQuery]);



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

    const isOutsideFolderDestinationVisible = true;

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

    function handleSelectMoveDestination(destinationId: string) {
        setSelectedDestinationFolderId(destinationId);
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
                className="edms-workspace-content"
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

                            minWidth: 0,
                            gap: isPhoneWorkspace ? 8 : 12,

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
                                ...(isPhoneWorkspace ? { width: "100%", justifyContent: "flex-end" } : {}),
                            }}
                        >
                            <WorkspaceViewControls
                                viewMode={viewMode}
                                onChangeViewMode={setViewMode}
                            />
                        </div>

                        <div
                            style={{
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexWrap: isPhoneWorkspace ? "wrap" : "nowrap",
                                gap: 10,
                                minWidth: 0,
                                width: isPhoneWorkspace ? "100%" : undefined,
                                flex: isPhoneWorkspace ? "0 0 100%" : 1,
                            }}
                        >
                            {/* File count + page size */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    flexWrap: "wrap",
                                    ...(isPhoneWorkspace
                                        ? {
                                            position: "relative",
                                            minWidth: 0,
                                            width: "100%",
                                            justifyContent: "space-between",
                                            order: 2,
                                        }
                                        : {
                                            position: "absolute",
                                            [direction === "rtl" ? "left" : "right"]: 0,
                                        }),
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

                                    <EdmsSelect
                                        value={itemsPerPage}
                                        options={WORKSPACE_PAGE_SIZE_OPTIONS.map((pageSize) => ({
                                            value: pageSize,
                                            label: String(pageSize),
                                        }))}
                                        onChange={(value) => {
                                            setItemsPerPage(Number(value));
                                            setCurrentPage(1);
                                        }}
                                        ariaLabel={
                                            direction === "rtl"
                                                ? "تعداد آیتم در هر صفحه"
                                                : "Items per page"
                                        }
                                        width={82}
                                        minWidth={82}
                                        height={36}
                                        maxMenuHeight={180}
                                    />
                                </div>
                            </div>

                            {/* Pagination */}
                            {totalWorkspacePages > 1 && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 4,
                                        direction,
                                        flexShrink: 0,
                                        maxWidth: "100%",
                                        ...(isPhoneWorkspace
                                            ? {
                                                width: "100%",
                                                overflowX: "auto",
                                                order: 1,
                                            }
                                            : {}),
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
                                            width: isPhoneWorkspace ? 28 : 32,
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
                                            width: isPhoneWorkspace ? 28 : 32,
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

                                    {paginationPageNumbers.map((pageNumber) => {
                                        const isActivePage =
                                            pageNumber === safeCurrentPage;

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
                                                    setCurrentPage(pageNumber)
                                                }
                                                style={{
                                                    minWidth: isPhoneWorkspace ? 28 : 32,
                                                    height: 32,
                                                    paddingInline: 8,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
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
                                    })}

                                    <button
                                        type="button"
                                        aria-label={
                                            direction === "rtl"
                                                ? "صفحه بعد"
                                                : "Next page"
                                        }
                                        disabled={
                                            safeCurrentPage >= totalWorkspacePages
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
                                            width: isPhoneWorkspace ? 28 : 32,
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
                                                safeCurrentPage >= totalWorkspacePages
                                                    ? "default"
                                                    : "pointer",
                                            opacity:
                                                safeCurrentPage >= totalWorkspacePages
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
                                            safeCurrentPage >= totalWorkspacePages
                                        }
                                        onClick={() =>
                                            setCurrentPage(totalWorkspacePages)
                                        }
                                        style={{
                                            width: isPhoneWorkspace ? 28 : 32,
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
                                                safeCurrentPage >= totalWorkspacePages
                                                    ? "default"
                                                    : "pointer",
                                            opacity:
                                                safeCurrentPage >= totalWorkspacePages
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

                {selectedWorkspaceItemCount > 0 && (
                    <View
                        style={[
                            styles.selectionToolbar,
                            isPhoneWorkspace && styles.phoneSelectionToolbar,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.primary,
                            },
                        ]}
                    >
                        <View style={[styles.selectionToolbarSummary, isPhoneWorkspace && styles.phoneSelectionToolbarRow]}>
                            <View
                                style={[
                                    styles.selectionCountBadge,
                                    {
                                        backgroundColor: colors.primary,
                                    },
                                ]}
                            >
                                <Text style={styles.selectionCountBadgeText}>
                                    {selectedWorkspaceItemCount}
                                </Text>
                            </View>

                            <Text
                                style={[
                                    styles.selectionToolbarText,
                                    {
                                        color: colors.text,
                                        textAlign,
                                    },
                                ]}
                            >
                                {direction === "rtl"
                                    ? `${selectedWorkspaceItemCount} مورد انتخاب شده`
                                    : `${selectedWorkspaceItemCount} selected`}
                            </Text>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={
                                    allPageWorkspaceItemsSelected
                                        ? t("deselectItems")
                                        : t("selectItems")
                                }
                                onPress={
                                    allPageWorkspaceItemsSelected
                                        ? handleDeselectAllPageWorkspaceItems
                                        : handleSelectAllPageWorkspaceItems
                                }
                                style={({ pressed }) => [
                                    styles.selectionTextButton,
                                    { borderColor: colors.border, backgroundColor: colors.background },
                                    pressed && styles.pressedSelectionAction,
                                ]}
                            >
                                <Feather name={allPageWorkspaceItemsSelected ? "x-square" : "check-square"} size={14} color={colors.primary} />
                                <Text style={[styles.selectionTextButtonLabel, { color: colors.primary }]}>
                                    {allPageWorkspaceItemsSelected
                                        ? t("deselectItems")
                                        : t("selectItems")}
                                </Text>
                            </Pressable>

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={direction === "rtl" ? "معکوس کردن انتخاب این صفحه" : "Invert selection on this page"}
                                onPress={handleInvertPageWorkspaceSelection}
                                style={({ pressed }) => [
                                    styles.selectionTextButton,
                                    { borderColor: colors.border, backgroundColor: colors.background },
                                    pressed && styles.pressedSelectionAction,
                                ]}
                            >
                                <Feather name="repeat" size={14} color={colors.primary} />
                                <Text style={[styles.selectionTextButtonLabel, { color: colors.primary }]}>
                                    {direction === "rtl" ? "معکوس" : "Invert"}
                                </Text>
                            </Pressable>
                        </View>

                        <View style={[styles.selectionToolbarActions, isPhoneWorkspace && styles.phoneSelectionToolbarRow]}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={
                                    allSelectedWorkspaceItemsPinned
                                        ? t("unpinItem")
                                        : t("pinItem")
                                }
                                onPress={handleBulkTogglePinnedWorkspaceItems}
                                style={({ pressed }) => [
                                    styles.selectionActionButton,
                                    {
                                        borderColor: colors.border,
                                        backgroundColor: colors.background,
                                    },
                                    pressed && styles.pressedSelectionAction,
                                ]}
                            >
                                <Feather
                                    name="pin"
                                    size={16}
                                    color={colors.primary}
                                />
                                <Text
                                    style={[
                                        styles.selectionActionLabel,
                                        {
                                            color: colors.text,
                                        },
                                    ]}
                                >
                                    {allSelectedWorkspaceItemsPinned
                                        ? t("unpinItem")
                                        : t("pinItem")}
                                </Text>
                            </Pressable>

                            {pageType === "workspace" && (
                                <>
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={t("moveItem")}
                                        onPress={handleRequestBulkMoveWorkspaceItems}
                                        style={({ pressed }) => [
                                            styles.selectionActionButton,
                                            {
                                                borderColor: colors.border,
                                                backgroundColor: colors.background,
                                            },
                                            pressed && styles.pressedSelectionAction,
                                        ]}
                                    >
                                        <Feather
                                            name="folder"
                                            size={16}
                                            color={colors.primary}
                                        />
                                        <Text
                                            style={[
                                                styles.selectionActionLabel,
                                                {
                                                    color: colors.text,
                                                },
                                            ]}
                                        >
                                            {t("moveItem")}
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={t("deleteOrArchiveItem")}
                                        onPress={handleRequestBulkDeleteWorkspaceItems}
                                        style={({ pressed }) => [
                                            styles.selectionActionButton,
                                            {
                                                borderColor: "#D97706",
                                                backgroundColor: colors.background,
                                            },
                                            pressed && styles.pressedSelectionAction,
                                        ]}
                                    >
                                        <Feather
                                            name="archive"
                                            size={16}
                                            color="#D97706"
                                        />
                                        <Text
                                            style={[
                                                styles.selectionActionLabel,
                                                {
                                                    color: "#D97706",
                                                },
                                            ]}
                                        >
                                            {t("deleteOrArchive")}
                                        </Text>
                                    </Pressable>
                                </>
                            )}

                            {pageType === "archive" && (
                                <>
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={t("restoreFromArchive")}
                                        onPress={handleBulkRestoreWorkspaceItems}
                                        style={({ pressed }) => [
                                            styles.selectionActionButton,
                                            {
                                                borderColor: colors.border,
                                                backgroundColor: colors.background,
                                            },
                                            pressed && styles.pressedSelectionAction,
                                        ]}
                                    >
                                        <Feather
                                            name="rotate-ccw"
                                            size={16}
                                            color={colors.primary}
                                        />
                                        <Text
                                            style={[
                                                styles.selectionActionLabel,
                                                {
                                                    color: colors.text,
                                                },
                                            ]}
                                        >
                                            {t("restore")}
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={t("moveArchivedToTrash")}
                                        onPress={handleBulkMoveWorkspaceItemsToTrash}
                                        style={({ pressed }) => [
                                            styles.selectionActionButton,
                                            {
                                                borderColor: "#DC2626",
                                                backgroundColor: colors.background,
                                            },
                                            pressed && styles.pressedSelectionAction,
                                        ]}
                                    >
                                        <Feather
                                            name="trash-2"
                                            size={16}
                                            color="#DC2626"
                                        />
                                        <Text
                                            style={[
                                                styles.selectionActionLabel,
                                                {
                                                    color: "#DC2626",
                                                },
                                            ]}
                                        >
                                            {t("moveToTrash")}
                                        </Text>
                                    </Pressable>
                                </>
                            )}

                            {pageType === "trash" && (
                                <>
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={t("restoreFromTrash")}
                                        onPress={handleBulkRestoreWorkspaceItems}
                                        style={({ pressed }) => [
                                            styles.selectionActionButton,
                                            {
                                                borderColor: colors.border,
                                                backgroundColor: colors.background,
                                            },
                                            pressed && styles.pressedSelectionAction,
                                        ]}
                                    >
                                        <Feather
                                            name="rotate-ccw"
                                            size={16}
                                            color={colors.primary}
                                        />
                                        <Text
                                            style={[
                                                styles.selectionActionLabel,
                                                {
                                                    color: colors.text,
                                                },
                                            ]}
                                        >
                                            {t("restore")}
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={t("permanentlyDeleteItem")}
                                        onPress={handleRequestBulkPermanentDeleteWorkspaceItems}
                                        style={({ pressed }) => [
                                            styles.selectionActionButton,
                                            {
                                                borderColor: "#DC2626",
                                                backgroundColor: colors.background,
                                            },
                                            pressed && styles.pressedSelectionAction,
                                        ]}
                                    >
                                        <Feather
                                            name="trash-2"
                                            size={16}
                                            color="#DC2626"
                                        />
                                        <Text
                                            style={[
                                                styles.selectionActionLabel,
                                                {
                                                    color: "#DC2626",
                                                },
                                            ]}
                                        >
                                            {t("permanentlyDeleteItem")}
                                        </Text>
                                    </Pressable>
                                </>
                            )}

                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={
                                    direction === "rtl"
                                        ? "لغو انتخاب"
                                        : "Clear selection"
                                }
                                onPress={handleClearWorkspaceSelection}
                                style={({ pressed }) => [
                                    styles.selectionIconButton,
                                    {
                                        borderColor: colors.border,
                                        backgroundColor: colors.background,
                                    },
                                    pressed && styles.pressedSelectionAction,
                                ]}
                            >
                                <Feather
                                    name="x"
                                    size={17}
                                    color={colors.text}
                                />
                            </Pressable>
                        </View>
                    </View>
                )}

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
                                                                        isPreviewOpen
                                                                    }
                                                                    isMultiSelected={
                                                                        multiSelectedItemIds.includes(item.id)
                                                                    }
                                                                    onPress={
                                                                        handlePressWorkspaceItem
                                                                    }
                                                                    onToggleSelection={
                                                                        handleToggleWorkspaceItemSelection
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
                                                            categoryDefinitions={
                                                                workspaceCategoryDefinitions
                                                            }
                                                            onClose={
                                                                handleCloseDocumentPreview
                                                            }
                                                            onOpenFullPreview={
                                                                onOpenPreviewPage
                                                            }
                                                            onUpdateItem={
                                                                onUpdateItem
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

                                        const isPreviewOpen =
                                            previewItemId === item.id &&
                                            item.type === "file";

                                        return (
                                            <Fragment key={item.id}>

                                                <WorkspaceItemCard
                                                    item={item}
                                                    viewMode={viewMode}
                                                    isCompact={
                                                        isCompactWorkspace
                                                    }
                                                    isSelected={
                                                        isPreviewOpen
                                                    }
                                                    isMultiSelected={
                                                        multiSelectedItemIds.includes(item.id)
                                                    }
                                                    onPress={
                                                        handlePressWorkspaceItem
                                                    }
                                                    onToggleSelection={
                                                        handleToggleWorkspaceItemSelection
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
                                                            categoryDefinitions={
                                                                workspaceCategoryDefinitions
                                                            }
                                                            onClose={
                                                                handleCloseDocumentPreview
                                                            }
                                                            onOpenFullPreview={
                                                                onOpenPreviewPage
                                                            }
                                                            onUpdateItem={
                                                                onUpdateItem
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
                    (pendingDeleteItemId !== null || isBulkDeletePending)
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
                selectedDestinationId={selectedDestinationFolderId}
                destinationFolders={destinationFolders}
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
                onSelectDestination={
                    handleSelectMoveDestination
                }
                onSave={handleSaveMoveWorkspaceItem}
                onCancel={handleCancelMoveWorkspaceItem}
            />

            <WorkspacePermanentDeleteDialog
                visible={
                    pageType === "trash" &&
                    (pendingPermanentDeleteItemId !== null || isBulkPermanentDeletePending)
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


    selectionToolbar: {
        position: "sticky",
        top: spacing.sm,
        zIndex: 30,

        width: "100%",

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",

        gap: spacing.sm,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,

        borderWidth: 1,
        borderRadius: radius.lg,

        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.14)",

        animation:
            "edms-workspace-panel-in 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",

        backdropFilter: "blur(10px)",
    },

    phoneSelectionToolbar: {
        paddingHorizontal: spacing.sm,
        alignItems: "stretch",
    },

    phoneSelectionToolbarRow: {
        width: "100%",
        minWidth: 0,
        justifyContent: "flex-start",
    },

    selectionToolbarSummary: {
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: spacing.sm,
    },

    selectionToolbarActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        gap: spacing.xs,
    },

    selectionCountBadge: {
        minWidth: 28,
        height: 28,
        paddingHorizontal: spacing.xs,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.pill,
        transition: "transform 150ms ease",
    },

    selectionCountBadgeText: {
        color: "#ffffff",
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
    },

    selectionToolbarText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },

    selectionTextButton: {
        minHeight: 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderWidth: 1,
        borderRadius: radius.md,
        transition: "transform 140ms ease, opacity 140ms ease",
    },

    selectionTextButtonLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
    },

    selectionActionButton: {
        minHeight: 34,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderWidth: 1,
        borderRadius: radius.md,
        transition:
            "transform 140ms ease, opacity 140ms ease, background-color 140ms ease, border-color 140ms ease",
    },

    selectionActionLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        whiteSpace: "nowrap",
    },

    selectionIconButton: {
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderRadius: radius.pill,
        transition: "transform 140ms ease, opacity 140ms ease",
    },

    pressedSelectionAction: {
        opacity: 0.78,
        transform: "scale(0.96)",
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

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

import { Fragment, useEffect, useRef, useState } from "react";

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
}: WorkspaceProps) {
    const { direction, t, theme } = useSettings();
    const colors = theme.colors;
    const { textAlign } = getDirectionalLayout(direction);

    const { width } = useWindowDimensions();

    const isPhoneWorkspace = width < 430;
    const isCompactWorkspace = width < 920;

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

    const visibleWorkspaceItems = [...filteredWorkspaceItems].sort(
        (firstItem, secondItem) =>
            Number(Boolean(secondItem.isPinned)) - Number(Boolean(firstItem.isPinned))
    );

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

                <ScrollView
                    style={styles.workspaceBody}
                    contentContainerStyle={styles.workspaceBodyContent}
                    showsVerticalScrollIndicator
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {shouldShowWorkspaceItems && (
                        <View style={
                            viewMode === "grid"
                                ? [
                                    styles.workspaceGrid,
                                    isPhoneWorkspace && styles.phoneWorkspaceGrid,
                                ]
                                : styles.workspaceList
                        }>
                            {/**
                            * ============================================================================
                            * Workspace Items With Expanded Preview
                            * ----------------------------------------------------------------------------
                            * Keeps cards in the normal grid/list flow and renders preview as a full-width
                            * expanded row directly after the selected file.
                            * ============================================================================
                            */}

                            {visibleWorkspaceItems.map((item) => {
                                const isPreviewOpen = previewItemId === item.id && item.type === "file";

                                return (
                                    <Fragment key={item.id}>
                                        <WorkspaceItemCard
                                            item={item}
                                            viewMode={viewMode}
                                            isCompact={isCompactWorkspace}
                                            isSelected={selectedItemId === item.id || isPreviewOpen}
                                            onPress={handlePressWorkspaceItem}
                                            onOpenActions={handleOpenWorkspaceItemActions}
                                            onTogglePinned={onTogglePinnedItem}
                                        />

                                        {isPreviewOpen && (
                                            <View style={styles.workspacePreviewRow}>
                                                {/**
                                                * ============================================================================
                                                * Full Preview Navigation
                                                * ----------------------------------------------------------------------------
                                                * Opens the dedicated document preview page instead of expanding inside the
                                                * workspace grid.
                                                * ============================================================================
                                                */}

                                                <WorkspaceDocumentPreviewPanel
                                                    item={item}
                                                    onClose={handleCloseDocumentPreview}
                                                    onOpenFullPreview={onOpenPreviewPage}
                                                />
                                            </View>
                                        )}
                                    </Fragment>
                                );
                            })}
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
            </View>

            <WorkspaceDeleteDialog
                visible={pageType === "workspace" && pendingDeleteItemId !== null}
                onMoveToTrash={handleMovePendingWorkspaceItemToTrash}
                onArchive={handleArchivePendingWorkspaceItem}
                onCancel={handleCancelDeleteWorkspaceItem}
            />

            <WorkspaceRenameDialog
                visible={pageType === "workspace" && pendingRenameItemId !== null}
                value={renameItemName}
                onChange={setRenameItemName}
                onSave={handleSaveRenameWorkspaceItem}
                onCancel={handleCancelRenameWorkspaceItem}
            />

            <WorkspaceMoveDialog
                visible={pageType === "workspace" && pendingMoveItemId !== null}
                value={
                    isMoveDestinationComboOpen
                        ? moveSearchQuery
                        : getSelectedDestinationLabel()
                }
                isOpen={isMoveDestinationComboOpen}
                destinationFolders={filteredDestinationFolders}
                outsideFolderDestinationId={MOVE_OUTSIDE_FOLDER_DESTINATION_ID}
                isOutsideFolderVisible={isOutsideFolderDestinationVisible}
                canSave={canSaveMoveWorkspaceItem}
                isDestinationDisabled={isMoveDestinationDisabled}
                onFocus={handleFocusMoveDestination}
                onChange={handleChangeMoveDestination}
                onToggle={handleToggleMoveDestination}
                onSelectOutsideFolder={() =>
                    handleSelectMoveDestination(
                        MOVE_OUTSIDE_FOLDER_DESTINATION_ID
                    )
                }
                onSelectDestination={handleSelectMoveDestination}
                onSave={handleSaveMoveWorkspaceItem}
                onCancel={handleCancelMoveWorkspaceItem}
            />

            <WorkspacePermanentDeleteDialog
                visible={
                    pageType === "trash" &&
                    pendingPermanentDeleteItemId !== null
                }
                onConfirm={handleConfirmPermanentDeleteWorkspaceItem}
                onCancel={handleCancelPermanentDeleteWorkspaceItem}
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
});

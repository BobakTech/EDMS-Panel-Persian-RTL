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
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "../../web/ui";

import { radius, shadows, spacing, typography } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
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

/**
 * ============================================================================
 * Workspace Empty State Import
 * ----------------------------------------------------------------------------
 * Imported directly because DroppedWorkspaceFile is exported from this file.
 * ============================================================================
 */

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

    /**
     * ============================================================================
     * Preview Page Callback
     * ----------------------------------------------------------------------------
     * Opens the full document preview page.
     * ============================================================================
     */
    onOpenFullPreview?: (item: WorkspaceItem) => void;
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
    onOpenFullPreview,
    onOpenPreviewPage,
}: WorkspaceProps) {
    const { t, theme } = useSettings();
    const colors = theme.colors;

    const dangerColor = "#DC2626";

    const { width } = useWindowDimensions();

    const isPhoneWorkspace = width < 430;
    const isCompactWorkspace = width < spacing.sidebarWidth * 3;

    const workspacePadding = isPhoneWorkspace
        ? spacing.xs
        : isCompactWorkspace
            ? spacing.lg
            : spacing.xl;
    const workspaceTopPadding = spacing.none;

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
     * Open Folder Or Select Item
     * ----------------------------------------------------------------------------
     * Folder cards open the folder. File cards keep the existing details behavior.
     * ============================================================================
     */

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

    /**
    * Selected file item shown in the document preview panel.
    */
    const previewItem =
        previewItemId
            ? visibleWorkspaceItems.find((item) => item.id === previewItemId) ?? null
            : null;

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

    const shouldShowEmptyStateActions =
        pageType === "workspace" && !normalizedSearchQuery;

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
                paddingHorizontal: spacing.none,
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

        flexDirection: "row",
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

    pressedFolderBackButton: {
        opacity: 0.82,
    },

    workspaceBody: {
        flex: 1,
        minHeight: 0,
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

    modalOverlay: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,

        width: "100vw",
        height: "100vh",

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
        flexDirection: "row",
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

/**
 * ============================================================================
 * App Layout
 * ----------------------------------------------------------------------------
 * Defines the responsive application shell, page routing, and workspace state.
 * ============================================================================
 */

import { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View,
} from "../../web/ui";

import { shadows, spacing } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";

import Dashboard from "./Dashboard";
import SettingsPage from "./SettingsPage";
import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import Workspace from "./Workspace";
import DocumentPreviewPage from "./DocumentPreviewPage";

import { getProjectInfo, type ProjectInfo } from "../project";

import {
    getWorkspaceItems,
    type WorkspaceActionType,
    type WorkspaceItem,
    type WorkspacePageType,
    type WorkspacePickedFile,
} from "../workspace";

import type { DroppedWorkspaceFile } from "../workspace/WorkspaceEmptyState";

/**
 * ============================================================================
 * Types
 * ============================================================================
 */

type ContentPageType = "dashboard" | WorkspacePageType;
type AppPageType = ContentPageType | "settings";

/**
 * ============================================================================
 * Helpers
 * ============================================================================
 */

function getFileExtension(fileName: string) {
    const extension = fileName.split(".").pop();

    return extension && extension !== fileName
        ? extension.toLowerCase()
        : "file";
}

function getFileSizeLabel(fileSize?: number) {
    if (!fileSize) {
        return "نامشخص";
    }

    const megaBytes = fileSize / (1024 * 1024);

    if (megaBytes >= 1) {
        return `${megaBytes.toFixed(1)} MB`;
    }

    const kiloBytes = fileSize / 1024;

    return `${Math.max(1, Math.round(kiloBytes))} KB`;
}

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function AppLayout() {
    const { direction, theme } = useSettings();
    const colors = theme.colors;

    const { width } = useWindowDimensions();

    /**
     * Mobile shell uses CSS viewport width, not physical device pixels.
     * Nothing Phone 1 is roughly 393 CSS px wide in portrait.
     */
    const isMobileShell = width < 760;
    const isPhoneShell = width < 430;

    const [workspaceItems, setWorkspaceItems] = useState<WorkspaceItem[]>(() =>
        getWorkspaceItems()
    );

    const [activeWorkspaceAction, setActiveWorkspaceAction] =
        useState<WorkspaceActionType | null>(null);

    const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState("");

    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

    /**
     * ============================================================================
     * Full Preview Selection State
     * ----------------------------------------------------------------------------
     * Stores the selected workspace item id while switching from the workspace
     * layout to the standalone document preview page.
     * ============================================================================
     */
    const [previewPageItemId, setPreviewPageItemId] = useState<string | null>(null);

    /**
     * ============================================================================
     * Initial Page State
     * ----------------------------------------------------------------------------
     * Opens the panel on Dashboard by default.
     * ============================================================================
     */
    const [activeWorkspacePage, setActiveWorkspacePage] =
        useState<ContentPageType>("dashboard");

    const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
    const [isProjectInfoLoading, setIsProjectInfoLoading] = useState(true);
    const [projectInfoError, setProjectInfoError] = useState<string | null>(null);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const activeWorkspaceFolderId =
        activeWorkspacePage === "workspace" ? currentFolderId : null;

    const isWorkspacePage =
        activeWorkspacePage === "workspace" ||
        activeWorkspacePage === "archive" ||
        activeWorkspacePage === "trash";

    const previewPageItem =
        previewPageItemId
            ? workspaceItems.find((item) => item.id === previewPageItemId) ?? null
            : null;

    const previewPageItems = workspaceItems.filter((item) => {
        const matchesPage =
            (activeWorkspacePage === "workspace" && item.status === "active") ||
            (activeWorkspacePage === "archive" && item.status === "archived") ||
            (activeWorkspacePage === "trash" && item.status === "trashed");

        if (item.type !== "file" || !matchesPage) {
            return false;
        }

        if (
            activeWorkspacePage === "workspace" &&
            (item.parentFolderId ?? null) !== currentFolderId
        ) {
            return false;
        }

        const normalizedSearchQuery = workspaceSearchQuery.trim().toLowerCase();
        return (
            !normalizedSearchQuery ||
            item.name.toLowerCase().includes(normalizedSearchQuery) ||
            item.description.toLowerCase().includes(normalizedSearchQuery)
        );
    });

    const previewPageItemIndex = previewPageItem
        ? previewPageItems.findIndex((item) => item.id === previewPageItem.id)
        : -1;
    const previousPreviewPageItem =
        previewPageItemIndex > 0 ? previewPageItems[previewPageItemIndex - 1] : null;
    const nextPreviewPageItem =
        previewPageItemIndex >= 0 && previewPageItemIndex < previewPageItems.length - 1
            ? previewPageItems[previewPageItemIndex + 1]
            : null;

    /**
     * ============================================================================
     * Project Info Loading
     * ----------------------------------------------------------------------------
     * Loads project metadata from the configured frontend API placeholder.
     * ============================================================================
     */

    useEffect(() => {
        let isMounted = true;

        async function loadProjectInfo() {
            try {
                setIsProjectInfoLoading(true);
                setProjectInfoError(null);

                const loadedProjectInfo = await getProjectInfo();

                if (isMounted) {
                    setProjectInfo(loadedProjectInfo);
                }
            } catch {
                if (isMounted) {
                    setProjectInfoError("Project info unavailable.");
                }
            } finally {
                if (isMounted) {
                    setIsProjectInfoLoading(false);
                }
            }
        }

        loadProjectInfo();

        return () => {
            isMounted = false;
        };
    }, []);

    /**
     * ============================================================================
     * Workspace Actions
     * ============================================================================
     */

    function handlePressUpload() {
        setActiveWorkspaceAction("upload");
    }

    function handlePressCreateFolder() {
        setActiveWorkspaceAction("new-folder");
    }

    function handleDismissWorkspaceAction() {
        setActiveWorkspaceAction(null);
    }

    function handleChangeWorkspacePage(page: AppPageType) {
        if (page === "settings") {
            setIsSettingsOpen(true);
            setActiveWorkspaceAction(null);
            setIsMobileMenuOpen(false);
            return;
        }

        setActiveWorkspacePage(page);
        setIsSettingsOpen(false);
        setActiveWorkspaceAction(null);
        setIsMobileMenuOpen(false);
        setPreviewPageItemId(null);

        if (page !== "workspace") {
            setCurrentFolderId(null);
        }
    }

    function handleToggleMobileMenu() {
        setIsMobileMenuOpen((currentValue) => !currentValue);
    }

    function handleCloseMobileMenu() {
        setIsMobileMenuOpen(false);
    }

    function handleCreateFolder(folderName: string) {
        const trimmedFolderName = folderName.trim();

        if (!trimmedFolderName) {
            return;
        }

        setWorkspaceItems((currentItems) => {
            const newWorkspaceFolder: WorkspaceItem = {
                id: `folder-${Date.now()}`,
                type: "folder",
                name: trimmedFolderName,
                description: "پوشه ایجاد شده در فضای کاری",
                updatedAt: new Date().toISOString(),
                status: "active",
                parentFolderId: activeWorkspaceFolderId,
                childrenCount: 0,
            };

            const firstFileIndex = currentItems.findIndex(
                (item) => item.type === "file"
            );

            const insertIndex =
                firstFileIndex === -1
                    ? currentItems.length
                    : firstFileIndex;

            return [
                ...currentItems.slice(0, insertIndex),
                newWorkspaceFolder,
                ...currentItems.slice(insertIndex),
            ];
        });

        setActiveWorkspaceAction(null);
    }

    function handleCreateFile(file: WorkspacePickedFile) {
        const trimmedFileName = file.name.trim();

        if (!trimmedFileName) {
            return;
        }

        setWorkspaceItems((currentItems) => {
            const newWorkspaceFile: WorkspaceItem = {
                id: `file-${Date.now()}`,
                type: "file",
                name: trimmedFileName,
                description: "فایل انتخاب شده از دستگاه",
                updatedAt: new Date().toISOString(),
                status: "active",
                parentFolderId:
                    activeWorkspacePage === "workspace"
                        ? activeWorkspaceFolderId
                        : null,
                extension: getFileExtension(trimmedFileName),
                sizeLabel: getFileSizeLabel(file.size),
                sizeBytes: file.size,
                mimeType: file.mimeType,
                localUri: file.uri,
            };

            const lastFileIndex = currentItems.findLastIndex(
                (item) => item.type === "file"
            );

            const insertIndex =
                lastFileIndex === -1
                    ? currentItems.length
                    : lastFileIndex + 1;

            return [
                ...currentItems.slice(0, insertIndex),
                newWorkspaceFile,
                ...currentItems.slice(insertIndex),
            ];
        });

        setActiveWorkspaceAction(null);
    }

    function handleCreateFolderFromMobileMenu(folderName: string) {
        handleCreateFolder(folderName);
        handleCloseMobileMenu();
    }

    function handleCreateFileFromMobileMenu(file: WorkspacePickedFile) {
        handleCreateFile(file);
        handleCloseMobileMenu();
    }

    function handleDropWorkspaceFiles(files: DroppedWorkspaceFile[]) {
        if (activeWorkspacePage !== "workspace" || files.length === 0) {
            return;
        }

        setWorkspaceItems((currentItems) => {
            const createdAt = Date.now();

            const droppedFiles: WorkspaceItem[] = files.map((file, index) => ({
                id: `file-${createdAt}-${index}`,
                type: "file",
                name: file.name,
                description: "فایل رها شده در فضای کاری",
                updatedAt: new Date().toISOString(),
                status: "active",
                parentFolderId: currentFolderId,
                extension: getFileExtension(file.name),
                sizeLabel: getFileSizeLabel(file.size),
                sizeBytes: file.size,
                mimeType: file.mimeType,
                localUri: file.uri,
            }));

            const lastFileIndex = currentItems.findLastIndex(
                (item) => item.type === "file"
            );

            const insertIndex =
                lastFileIndex === -1
                    ? currentItems.length
                    : lastFileIndex + 1;

            return [
                ...currentItems.slice(0, insertIndex),
                ...droppedFiles,
                ...currentItems.slice(insertIndex),
            ];
        });
    }

    function handleArchiveWorkspaceItem(itemId: string) {
        setWorkspaceItems((currentItems) =>
            currentItems.map((item) =>
                item.id === itemId
                    ? {
                        ...item,
                        status: "archived",
                        updatedAt: new Date().toISOString(),
                    }
                    : item
            )
        );
    }

    function handleMoveWorkspaceItemToTrash(itemId: string) {
        setWorkspaceItems((currentItems) =>
            currentItems.map((item) =>
                item.id === itemId
                    ? {
                        ...item,
                        status: "trashed",
                        updatedAt: new Date().toISOString(),
                    }
                    : item
            )
        );
    }

    function handleRestoreWorkspaceItem(restoredItem: WorkspaceItem) {
        setWorkspaceItems((currentItems) =>
            currentItems.map((item) =>
                item.id === restoredItem.id
                    ? {
                        ...item,
                        status: "active",
                        updatedAt: new Date().toISOString(),
                    }
                    : item
            )
        );
    }

    function handleRenameWorkspaceItem(itemId: string, newName: string) {
        const trimmedNewName = newName.trim();

        if (!trimmedNewName) {
            return;
        }

        setWorkspaceItems((currentItems) =>
            currentItems.map((item) =>
                item.id === itemId
                    ? {
                        ...item,
                        name: trimmedNewName,
                        updatedAt: new Date().toISOString(),
                    }
                    : item
            )
        );
    }

    function handleDeleteWorkspaceItem(itemId: string) {
        setWorkspaceItems((currentItems) =>
            currentItems.filter((item) => item.id !== itemId)
        );
    }

    function handleMoveWorkspaceItem(
        itemId: string,
        destinationFolderId: string | null
    ) {
        setWorkspaceItems((currentItems) =>
            currentItems.map((item) =>
                item.id === itemId
                    ? {
                        ...item,
                        parentFolderId: destinationFolderId,
                        updatedAt: new Date().toISOString(),
                    }
                    : item
            )
        );
    }

    function handleTogglePinnedWorkspaceItem(itemId: string) {
        setWorkspaceItems((currentItems) =>
            currentItems.map((item) =>
                item.id === itemId
                    ? { ...item, isPinned: !item.isPinned }
                    : item
            )
        );
    }

    /**
     * ============================================================================
     * Full Preview Navigation
     * ----------------------------------------------------------------------------
     * Switches the workspace view into the standalone document preview layout for
     * the selected file.
     * ============================================================================
     */
    function handleOpenPreviewPage(item: WorkspaceItem) {
        if (item.type !== "file") {
            return;
        }

        setPreviewPageItemId(item.id);
        setActiveWorkspaceAction(null);
        setIsMobileMenuOpen(false);
    }

    /**
     * Closes the full document preview page.
     */
    function handleClosePreviewPage() {
        setPreviewPageItemId(null);
    }

    return (
        <View
            style={[
                styles.container,
                isMobileShell && styles.mobileContainer,
                {
                    backgroundColor: colors.background,
                    direction,
                },
            ]}
        >
            {!isMobileShell && (
                <Sidebar
                    activePage={isSettingsOpen ? "settings" : activeWorkspacePage}
                    projectInfo={projectInfo}
                    isProjectInfoLoading={isProjectInfoLoading}
                    projectInfoError={projectInfoError}
                    onChangePage={handleChangeWorkspacePage}
                />
            )}

            <View
                style={[
                    styles.main,
                    isMobileShell && styles.mobileMain,
                    isPhoneShell && styles.phoneMain,
                ]}
            >
                <Toolbar
                    variant={isMobileShell ? "mobile-header" : "desktop"}
                    activeAction={activeWorkspaceAction}
                    searchQuery={workspaceSearchQuery}
                    canCreateWorkspaceItems={activeWorkspacePage === "workspace"}
                    projectInfo={projectInfo}
                    isProjectInfoLoading={isProjectInfoLoading}
                    projectInfoError={projectInfoError}
                    isMobileMenuOpen={isMobileMenuOpen}
                    onPressMobileMenu={handleToggleMobileMenu}
                    onChangeSearchQuery={setWorkspaceSearchQuery}
                    onPressCreateFolder={handlePressCreateFolder}
                    onDismissAction={handleDismissWorkspaceAction}
                    onCreateFolder={handleCreateFolder}
                    onCreateFile={handleCreateFile}
                />

                <Modal
                    transparent
                    visible={isMobileShell && isMobileMenuOpen}
                    animationType="fade"
                    onRequestClose={handleCloseMobileMenu}
                >
                    <View style={styles.mobileDrawerModal}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="بستن منوی موبایل"
                            onPress={handleCloseMobileMenu}
                            style={styles.mobileDrawerBackdrop}
                        />

                        <View
                            style={[
                                styles.mobileDrawer,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <View style={styles.toolbarLayer}>
                                <Toolbar
                                    variant="mobile-menu"
                                    activeAction={activeWorkspaceAction}
                                    searchQuery={workspaceSearchQuery}
                                    canCreateWorkspaceItems={activeWorkspacePage === "workspace"}
                                    projectInfo={projectInfo}
                                    isProjectInfoLoading={isProjectInfoLoading}
                                    projectInfoError={projectInfoError}
                                    isMobileMenuOpen={isMobileMenuOpen}
                                    onPressMobileMenu={handleToggleMobileMenu}
                                    onChangeSearchQuery={setWorkspaceSearchQuery}
                                    onPressCreateFolder={handlePressCreateFolder}
                                    onDismissAction={handleDismissWorkspaceAction}
                                    onCreateFolder={handleCreateFolder}
                                    onCreateFile={handleCreateFile}
                                />
                            </View>

                            <Sidebar
                                variant="drawer"
                                showBrand={false}
                                activePage={isSettingsOpen ? "settings" : activeWorkspacePage}
                                projectInfo={projectInfo}
                                isProjectInfoLoading={isProjectInfoLoading}
                                projectInfoError={projectInfoError}
                                onChangePage={handleChangeWorkspacePage}
                            />
                        </View>
                    </View>
                </Modal>

                <View style={styles.pageSlot}>
                    {previewPageItem ? (
                        <DocumentPreviewPage
                            item={previewPageItem}
                            onBack={handleClosePreviewPage}
                            onPrevious={
                                previousPreviewPageItem
                                    ? () => setPreviewPageItemId(previousPreviewPageItem.id)
                                    : undefined
                            }
                            onNext={
                                nextPreviewPageItem
                                    ? () => setPreviewPageItemId(nextPreviewPageItem.id)
                                    : undefined
                            }
                        />
                    ) : isWorkspacePage ? (
                        <Workspace
                            pageType={activeWorkspacePage}
                            currentFolderId={currentFolderId}
                            workspaceItems={workspaceItems}
                            searchQuery={workspaceSearchQuery}
                            onChangeFolder={setCurrentFolderId}
                            onPressCreateFolder={handlePressCreateFolder}
                            onPressUpload={handlePressUpload}
                            onArchiveItem={handleArchiveWorkspaceItem}
                            onMoveItemToTrash={handleMoveWorkspaceItemToTrash}
                            onRestoreItem={handleRestoreWorkspaceItem}
                            onRenameItem={handleRenameWorkspaceItem}
                            onDeleteItem={handleDeleteWorkspaceItem}
                            onMoveItem={handleMoveWorkspaceItem}
                            onTogglePinnedItem={handleTogglePinnedWorkspaceItem}
                            onOpenDashboard={() => setActiveWorkspacePage("dashboard")}
                            onDropFiles={handleDropWorkspaceFiles}
                            onOpenPreviewPage={handleOpenPreviewPage}
                            onOpenFullPreview={handleOpenPreviewPage}
                        />
                    ) : (
                        <ScrollView
                            style={styles.pageScroller}
                            contentContainerStyle={styles.pageScrollerContent}
                            showsVerticalScrollIndicator
                            showsHorizontalScrollIndicator={false}
                        >
                            <Dashboard workspaceItems={workspaceItems} />
                        </ScrollView>
                    )}
                </View>

                {isSettingsOpen && (
                    <SettingsPage onClose={() => setIsSettingsOpen(false)} />
                )}
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
        minWidth: 0,
        minHeight: 0,

        flexDirection: "row",
        direction: "rtl",

        overflow: "hidden",
    },

    mobileContainer: {
        flexDirection: "column",
    },

    main: {
        flex: 1,
        minWidth: 0,
        minHeight: 0,

        padding: spacing.lg,

        gap: spacing.md,

        // Remove overflow: hidden to allow natural expansion and browser scrolling
        overflow: "visible",
    },

    mobileMain: {
        padding: spacing.sm,
    },

    /**
     * ============================================================================
     * Toolbar Layer
     * ----------------------------------------------------------------------------
     * Keeps floating toolbar panels above the workspace content.
     * ============================================================================
     */

    toolbarLayer: {
        position: "relative",
        zIndex: 20,
        elevation: 20,
    },

    pageSlot: {
        flex: 1,
        minWidth: 0,
        minHeight: 0,

        position: "relative",
        zIndex: 1,

        overflow: "hidden",
    },

    pageScroller: {
        flex: 1,
        minWidth: 0,
        minHeight: 0,
    },

    pageScrollerContent: {
        flexGrow: 1,
    },

    mobileDrawerModal: {
        flex: 1,

        alignItems: "flex-end",
    },

    mobileDrawerBackdrop: {
        ...StyleSheet.absoluteFill,

        backgroundColor: "rgba(0, 0, 0, 0.32)",
    },

    mobileDrawer: {
        zIndex: 1,

        width: "88%",
        maxWidth: 360,
        minWidth: 0,
        height: "100%",

        padding: spacing.lg,

        borderLeftWidth: 1,

        gap: spacing.lg,

        ...shadows.lg,
    },

    phoneMain: {
        padding: spacing.xs,
        gap: spacing.sm,
    },
});

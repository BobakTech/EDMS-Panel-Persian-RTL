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

import { Feather } from "../../web/icons";

import { semanticColors, shadows, spacing } from "../../theme";
import { useSettings } from "../../settings/SettingsContext";
import { getDirectionalLayout } from "../../settings/direction";

import Dashboard from "./Dashboard";
import SettingsPage from "./SettingsPage";
import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import Workspace from "./Workspace";
import DocumentPreviewPage from "./DocumentPreviewPage";

import {
    getProjects,
    createDefaultWorkspaceFilters,
    type WorkspaceFilters,
} from "../project";
import { projectFilterOptions } from "../project/project.mock";

import {
    getWorkspaceFileExtension,
    getWorkspaceFileSizeLabel,
    getWorkspaceItems,
    getWorkspaceCategoryDefinitions,
    insertWorkspaceFiles,
    insertWorkspaceFolder,
    removeWorkspaceItem,
    updateWorkspaceItem,
    type WorkspaceActionType,
    type WorkspaceItem,
    type WorkspacePageType,
    type WorkspacePickedFile,
    type WorkspaceCategoryDefinition,
} from "../workspace";

import type { DroppedWorkspaceFile } from "../workspace/WorkspaceEmptyState";

import {
    filterWorkspaceByCategory,
    getWorkspaceCategories,
} from "../workspace/workspace.categories";

/**
 * ============================================================================
 * Types
 * ============================================================================
 */

type ContentPageType = "dashboard" | WorkspacePageType;
type AppPageType = ContentPageType | "settings";

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function AppLayout() {
    const { direction, theme } = useSettings();
    const colors = theme.colors;
    const { isRtl } = getDirectionalLayout(direction);

    const { width } = useWindowDimensions();

    /** Mobile breakpoints use CSS viewport width. */
    const isMobileShell = width < 760;
    const isPhoneShell = width < 430;

    const [workspaceItems, setWorkspaceItems] = useState<WorkspaceItem[]>([]);

    const [
        workspaceCategoryDefinitions,
        setWorkspaceCategoryDefinitions,
    ] = useState<WorkspaceCategoryDefinition[]>([]);

    const [workspaceTotal, setWorkspaceTotal] = useState(0);
    const [workspaceOffset, setWorkspaceOffset] = useState(0);
    const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);

    const workspacePageSize = 100;

    const [activeWorkspaceAction, setActiveWorkspaceAction] =
        useState<WorkspaceActionType | null>(null);

    const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState("");

    const [activeWorkspaceCategory, setActiveWorkspaceCategory] = useState("all");

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

    const [isProjectInfoLoading, setIsProjectInfoLoading] = useState(true);
    const [projectInfoError, setProjectInfoError] = useState<string | null>(null);
    const [workspaceFilters, setWorkspaceFilters] = useState<WorkspaceFilters>(
        createDefaultWorkspaceFilters
    );

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const activeWorkspaceFolderId =
        activeWorkspacePage === "workspace" ? currentFolderId : null;

    const isWorkspacePage =
        activeWorkspacePage === "workspace" ||
        activeWorkspacePage === "archive" ||
        activeWorkspacePage === "trash";

    const fileTypeOptions = Array.from(
        new Set(
            workspaceItems
                .filter((item) => item.type === "file" && item.extension)
                .map((item) => item.extension as string)
        )
    ).sort();

    const filteredWorkspaceItems = workspaceItems.filter((item) => {
        const matchesProject =
            !workspaceFilters.projectId || item.projectId === workspaceFilters.projectId;
        const matchesFileType =
            !workspaceFilters.fileType ||
            item.type === "folder" ||
            item.extension?.toLowerCase() === workspaceFilters.fileType.toLowerCase();
        return matchesProject && matchesFileType;
    });
    const activeProjectId =
        workspaceFilters.projectId ??
        workspaceItems.find((item) => item.id === currentFolderId)?.projectId;
    const projectConnectionProps = {
        isProjectInfoLoading,
        projectInfoError,
    };
    const workspaceFilterProps = {
        projects: projectFilterOptions,
        fileTypes: fileTypeOptions,
        filters: workspaceFilters,
        onApplyFilters: handleApplyWorkspaceFilters,
        onResetFilters: handleResetWorkspaceFilters,
    };
    const workspaceCategories = getWorkspaceCategories(
        workspaceItems,
        workspaceCategoryDefinitions,
    );
    const toolbarProps = {
        activeAction: activeWorkspaceAction,
        searchQuery: workspaceSearchQuery,
        canCreateWorkspaceItems: activeWorkspacePage === "workspace",
        ...projectConnectionProps,
        ...workspaceFilterProps,
        isMobileMenuOpen,
        onPressMobileMenu: handleToggleMobileMenu,
        onChangeSearchQuery: setWorkspaceSearchQuery,
        onPressCreateFolder: handlePressCreateFolder,
        onDismissAction: handleDismissWorkspaceAction,
        onCreateFolder: handleCreateFolder,
        onCreateFile: handleCreateFile,
    };

    const previewPageItem =
        previewPageItemId
            ? filteredWorkspaceItems.find((item) => item.id === previewPageItemId) ?? null
            : null;

    const previewPageItems = filteredWorkspaceItems.filter((item) => {
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

    const loadMoreWorkspaceItems = async () => {
        if (isWorkspaceLoading || workspaceItems.length >= workspaceTotal) {
            return;
        }

        setIsWorkspaceLoading(true);

        try {
            const result = await getWorkspaceItems({
                from: workspaceOffset,
                cnt: workspacePageSize,
                search: workspaceSearchQuery.trim() || undefined,
            });

            setWorkspaceItems((current) => [
                ...current,
                ...result.items,
            ]);

            setWorkspaceOffset((current) =>
                current + result.items.length
            );

            setWorkspaceTotal(result.total);
        } finally {
            setIsWorkspaceLoading(false);
        }
    };

    /**
     * ============================================================================
     * Web-service Connection Check
     * ----------------------------------------------------------------------------
     * Checks only whether the configured project web service responds.
     * ============================================================================
     */

    useEffect(() => {
        let isMounted = true;

        async function checkConnection() {
            try {
                setIsProjectInfoLoading(true);
                setProjectInfoError(null);

                await getProjects();
            } catch {
                if (isMounted) {
                    setProjectInfoError("Project service unavailable.");
                }
            } finally {
                if (isMounted) {
                    setIsProjectInfoLoading(false);
                }
            }
        }

        checkConnection();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isCurrentRequest = true;

        const timer = setTimeout(() => {
            setIsWorkspaceLoading(true);

            getWorkspaceItems({
                from: 0,
                cnt: workspacePageSize,
                search: workspaceSearchQuery.trim() || undefined,
            })
                .then((result) => {
                    if (!isCurrentRequest) {
                        return;
                    }

                    setWorkspaceItems(result.items);
                    setWorkspaceTotal(result.total);
                    setWorkspaceOffset(result.items.length);
                })
                .finally(() => {
                    if (isCurrentRequest) {
                        setIsWorkspaceLoading(false);
                    }
                });
        }, 300);

        return () => {
            isCurrentRequest = false;
            clearTimeout(timer);
        };
    }, [workspaceSearchQuery]);

    useEffect(() => {
        getWorkspaceCategoryDefinitions()
            .then(setWorkspaceCategoryDefinitions)
            .catch(() => setWorkspaceCategoryDefinitions([]));
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

    function handleApplyWorkspaceFilters(filters: WorkspaceFilters) {
        setWorkspaceFilters(filters);
    }

    function handleResetWorkspaceFilters() {
        setWorkspaceFilters(createDefaultWorkspaceFilters());
    }

    function handleCreateFolder(folderName: string) {
        const trimmedFolderName = folderName.trim();

        if (!trimmedFolderName) {
            return;
        }

        setWorkspaceItems((currentItems) => {
            const newWorkspaceFolder: WorkspaceItem = {
                id: `folder-${Date.now()}`,
                projectId: activeProjectId,
                type: "folder",
                name: trimmedFolderName,
                description: "پوشه ایجاد شده در فضای کاری",
                updatedAt: new Date().toISOString(),
                status: "active",
                parentFolderId: activeWorkspaceFolderId,
                childrenCount: 0,
            };

            return insertWorkspaceFolder(currentItems, newWorkspaceFolder);
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
                projectId: activeProjectId,
                type: "file",
                name: trimmedFileName,
                description: "فایل انتخاب شده از دستگاه",
                updatedAt: new Date().toISOString(),
                status: "active",
                parentFolderId:
                    activeWorkspacePage === "workspace"
                        ? activeWorkspaceFolderId
                        : null,
                extension: getWorkspaceFileExtension(trimmedFileName),
                sizeLabel: getWorkspaceFileSizeLabel(file.size),
                sizeBytes: file.size,
                mimeType: file.mimeType,
                localUri: file.uri,
            };

            return insertWorkspaceFiles(currentItems, [newWorkspaceFile]);
        });

        setActiveWorkspaceAction(null);
    }

    function handleDropWorkspaceFiles(files: DroppedWorkspaceFile[]) {
        if (activeWorkspacePage !== "workspace" || files.length === 0) {
            return;
        }

        setWorkspaceItems((currentItems) => {
            const createdAt = Date.now();

            const droppedFiles: WorkspaceItem[] = files.map((file, index) => ({
                id: `file-${createdAt}-${index}`,
                projectId: activeProjectId,
                type: "file",
                name: file.name,
                description: "فایل رها شده در فضای کاری",
                updatedAt: new Date().toISOString(),
                status: "active",
                parentFolderId: currentFolderId,
                extension: getWorkspaceFileExtension(file.name),
                sizeLabel: getWorkspaceFileSizeLabel(file.size),
                sizeBytes: file.size,
                mimeType: file.mimeType,
                localUri: file.uri,
            }));

            return insertWorkspaceFiles(currentItems, droppedFiles);
        });
    }

    function handleArchiveWorkspaceItem(itemId: string) {
        setWorkspaceItems((currentItems) =>
            updateWorkspaceItem(currentItems, itemId, (item) => ({
                ...item,
                status: "archived",
                updatedAt: new Date().toISOString(),
            }))
        );
    }

    function handleMoveWorkspaceItemToTrash(itemId: string) {
        setWorkspaceItems((currentItems) =>
            updateWorkspaceItem(currentItems, itemId, (item) => ({
                ...item,
                status: "trashed",
                updatedAt: new Date().toISOString(),
            }))
        );
    }

    function handleRestoreWorkspaceItem(restoredItem: WorkspaceItem) {
        setWorkspaceItems((currentItems) =>
            updateWorkspaceItem(currentItems, restoredItem.id, (item) => ({
                ...item,
                status: "active",
                updatedAt: new Date().toISOString(),
            }))
        );
    }

    function handleRenameWorkspaceItem(itemId: string, newName: string) {
        const trimmedNewName = newName.trim();

        if (!trimmedNewName) {
            return;
        }

        setWorkspaceItems((currentItems) =>
            updateWorkspaceItem(currentItems, itemId, (item) => ({
                ...item,
                name: trimmedNewName,
                updatedAt: new Date().toISOString(),
            }))
        );
    }

    function handleDeleteWorkspaceItem(itemId: string) {
        setWorkspaceItems((currentItems) =>
            removeWorkspaceItem(currentItems, itemId)
        );
    }

    function handleMoveWorkspaceItem(
        itemId: string,
        destinationFolderId: string | null
    ) {
        setWorkspaceItems((currentItems) =>
            updateWorkspaceItem(currentItems, itemId, (item) => ({
                ...item,
                parentFolderId: destinationFolderId,
                updatedAt: new Date().toISOString(),
            }))
        );
    }

    function handleTogglePinnedWorkspaceItem(itemId: string) {
        setWorkspaceItems((currentItems) =>
            updateWorkspaceItem(currentItems, itemId, (item) => ({
                ...item,
                isPinned: !item.isPinned,
            }))
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
                    {...projectConnectionProps}
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
                    {...toolbarProps}
                    variant={isMobileShell ? "mobile-header" : "desktop"}
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
                                styles.mobileDrawerShell,
                                {
                                    right: isRtl ? 0 : undefined,
                                    left: isRtl ? undefined : 0,
                                    animation:
                                        isRtl
                                            ? "edms-drawer-in-rtl 180ms ease-out"
                                            : "edms-drawer-in-ltr 180ms ease-out",
                                },
                            ]}
                        >
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="بستن منوی موبایل"
                                onPress={handleCloseMobileMenu}
                                style={[
                                    styles.mobileDrawerCloseButton,
                                    isRtl ? { left: -48 } : { right: -48 },
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: colors.border,
                                    },
                                ]}
                            >
                                <Feather name="x" size={20} color={colors.text} />
                            </Pressable>

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
                                        {...toolbarProps}
                                        variant="mobile-menu"
                                    />
                                </View>

                                <Sidebar
                                    variant="drawer"
                                    showBrand={false}
                                    activePage={isSettingsOpen ? "settings" : activeWorkspacePage}
                                    {...projectConnectionProps}
                                    onChangePage={handleChangeWorkspacePage}
                                />
                            </View>
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
                            workspaceItems={filteredWorkspaceItems}
                            workspaceCategories={workspaceCategories}
                            activeWorkspaceCategory={activeWorkspaceCategory}
                            setActiveWorkspaceCategory={setActiveWorkspaceCategory}
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
                        />
                    ) : (
                        <ScrollView
                            style={styles.pageScroller}
                            contentContainerStyle={styles.pageScrollerContent}
                            showsVerticalScrollIndicator
                            showsHorizontalScrollIndicator={false}
                        >
                            <Dashboard workspaceItems={filteredWorkspaceItems} />
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
        minHeight: "100vh",

        flexDirection: "row",
        direction: "rtl",

        overflow: "visible",
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

        // Allow natural content expansion and browser scrolling.
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
        flexGrow: 1,
        flexShrink: 0,
        minWidth: 0,
        minHeight: 0,

        position: "relative",
        zIndex: 1,

        overflow: "visible",
    },

    pageScroller: {
        flexGrow: 0,
        flexShrink: 0,
        minWidth: 0,
        minHeight: 0,
        overflowY: "visible",
    },

    pageScrollerContent: {
        flexGrow: 1,
    },

    mobileDrawerModal: {
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        width: "100vw",
        height: "100vh",
        alignItems: "flex-end",
    },

    mobileDrawerBackdrop: {
        ...StyleSheet.absoluteFill,

        backgroundColor: semanticColors.backdrop,
    },

    mobileDrawerShell: {
        position: "absolute",
        top: 0,
        bottom: 0,
        width: "88%",
        maxWidth: 360,
        zIndex: 1,
    },

    mobileDrawer: {
        width: "100%",
        height: "100%",

        padding: spacing.lg,

        borderLeftWidth: 1,
        gap: spacing.lg,

        ...shadows.lg,
    },

    mobileDrawerCloseButton: {
        position: "absolute",
        top: spacing.sm,
        zIndex: 2,

        width: 40,
        height: 40,

        alignItems: "center",
        justifyContent: "center",

        borderWidth: 1,
        borderRadius: 8,
        cursor: "pointer",
    },

    phoneMain: {
        padding: spacing.xs,
        gap: spacing.sm,
    },
});

/**
 * ============================================================================
 * App Layout
 * ----------------------------------------------------------------------------
 * Defines the primary layout of the application.
 * ============================================================================
 */

import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import { spacing } from "../../theme";

import SettingsPage from "./SettingsPage";

import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import Workspace from "./Workspace";
import Dashboard from "./Dashboard";

import {
    getWorkspaceItems,
    type WorkspacePageType,
    type WorkspaceActionType,
    type WorkspaceItem,
    type WorkspacePickedFile,
} from "../workspace";

import { getProjectInfo, type ProjectInfo } from "../project";

import { useSettings } from "../../settings/SettingsContext";

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
 * Types
 * ============================================================================
 */

type AppPageType = "dashboard" | WorkspacePageType | "settings";

/**
 * ============================================================================
 * Component
 * ============================================================================
 */

export default function AppLayout() {
    const { theme } = useSettings();
    const colors = theme.colors;

    const [workspaceItems, setWorkspaceItems] = useState<WorkspaceItem[]>(() =>
        getWorkspaceItems()
    );

    const [activeWorkspaceAction, setActiveWorkspaceAction] =
        useState<WorkspaceActionType | null>(null);

    const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState("");

    const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
    const [isProjectInfoLoading, setIsProjectInfoLoading] = useState(true);
    const [projectInfoError, setProjectInfoError] = useState<string | null>(null);

    /**
     * ============================================================================
     * Project Info Loading
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
     * Workspace Location State
     * ----------------------------------------------------------------------------
     * Tracks the current workspace page and the currently opened folder.
     * ============================================================================
     */

    const [activeWorkspacePage, setActiveWorkspacePage] =
        useState<AppPageType>("dashboard");

    const [activeWorkspaceFolderId, setActiveWorkspaceFolderId] =
        useState<string | null>(null);

    function handlePressCreateFolder() {
        setActiveWorkspaceAction("new-folder");
    }

    function handleDismissWorkspaceAction() {
        setActiveWorkspaceAction(null);
    }

    /**
     * ============================================================================
     * Change Workspace Page
     * ----------------------------------------------------------------------------
     * Resets the opened folder when switching between Workspace, Archive, and Trash.
     * ============================================================================
     */

    function handleChangeWorkspacePage(page: AppPageType) {
        setActiveWorkspacePage(page);
        setActiveWorkspaceFolderId(null);
        setActiveWorkspaceAction(null);
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
                /**
                 * New folders are created inside the currently opened folder.
                 */
                parentFolderId:
                    activeWorkspacePage === "workspace"
                        ? activeWorkspaceFolderId
                        : null,
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
                    ? restoredItem
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

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.background,
                },
            ]}
        >
            <Sidebar
                activePage={activeWorkspacePage}
                projectInfo={projectInfo}
                isProjectInfoLoading={isProjectInfoLoading}
                projectInfoError={projectInfoError}
                onChangePage={handleChangeWorkspacePage}
            />

            <View style={styles.main}>
                <Toolbar
                    activeAction={activeWorkspaceAction}
                    searchQuery={workspaceSearchQuery}
                    canCreateWorkspaceItems={activeWorkspacePage === "workspace"}
                    onChangeSearchQuery={setWorkspaceSearchQuery}
                    onPressCreateFolder={handlePressCreateFolder}
                    onDismissAction={handleDismissWorkspaceAction}
                    onCreateFolder={handleCreateFolder}
                    onCreateFile={handleCreateFile}
                />

                {activeWorkspacePage === "dashboard" ? (
                    <Dashboard workspaceItems={workspaceItems} />
                ) : activeWorkspacePage === "settings" ? (
                    <SettingsPage />
                ) : (
                    <Workspace
                        pageType={activeWorkspacePage}
                        currentFolderId={activeWorkspaceFolderId}
                        workspaceItems={workspaceItems}
                        searchQuery={workspaceSearchQuery}
                        onArchiveItem={handleArchiveWorkspaceItem}
                        onChangeFolder={setActiveWorkspaceFolderId}
                        onOpenDashboard={() => handleChangeWorkspacePage("dashboard")}
                        onMoveItemToTrash={handleMoveWorkspaceItemToTrash}
                        onRestoreItem={handleRestoreWorkspaceItem}
                        onRenameItem={handleRenameWorkspaceItem}
                        onDeleteItem={handleDeleteWorkspaceItem}
                        onMoveItem={handleMoveWorkspaceItem}
                    />
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
        flexDirection: "row-reverse",
    },

    main: {
        flex: 1,

        marginRight: spacing.lg,
        paddingTop: spacing.sm,
        paddingLeft: spacing.sm,

        gap: spacing.md,
    },
});

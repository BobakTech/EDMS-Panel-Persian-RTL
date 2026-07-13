/**
 * ============================================================================
 * App Layout
 * ----------------------------------------------------------------------------
 * Defines the primary layout of the application.
 * ============================================================================
 */

import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { spacing } from "../../theme";

import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import Workspace from "./Workspace";

import {
    getWorkspaceItems,
    type WorkspacePageType,
    type WorkspaceActionType,
    type WorkspaceItem,
    type WorkspaceItemStatus,
    type WorkspacePickedFile,
} from "../workspace";

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

    const [activeWorkspacePage, setActiveWorkspacePage] =
        useState<WorkspacePageType>("workspace");

    function handlePressCreateFolder() {
        setActiveWorkspaceAction("new-folder");
    }

    function handleDismissWorkspaceAction() {
        setActiveWorkspaceAction(null);
    }

    function handleChangeWorkspacePage(page: WorkspacePageType) {
        setActiveWorkspacePage(page);
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
                onChangePage={handleChangeWorkspacePage}
            />

            <View style={styles.main}>
                <Toolbar
                    activeAction={activeWorkspaceAction}
                    searchQuery={workspaceSearchQuery}
                    onChangeSearchQuery={setWorkspaceSearchQuery}
                    onPressCreateFolder={handlePressCreateFolder}
                    onDismissAction={handleDismissWorkspaceAction}
                    onCreateFolder={handleCreateFolder}
                    onCreateFile={handleCreateFile}
                />

                <Workspace
                    pageType={activeWorkspacePage}
                    workspaceItems={workspaceItems}
                    searchQuery={workspaceSearchQuery}
                    onArchiveItem={handleArchiveWorkspaceItem}
                    onMoveItemToTrash={handleMoveWorkspaceItemToTrash}
                    onRestoreItem={handleRestoreWorkspaceItem}
                />
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
    },
});
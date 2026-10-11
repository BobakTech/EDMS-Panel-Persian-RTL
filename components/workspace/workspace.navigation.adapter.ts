import type { CardNavigation } from "./Card";
import type { WorkspacePresentationNavigation } from "./workspace.presentation";
import type { WorkspaceItem } from "./workspace.types";

/** UI navigation targets are explicit; this adapter alone knows legacy folder semantics. */
export const WORKSPACE_ROOT_TARGET = "workspace:root";
export const WORKSPACE_DASHBOARD_TARGET = "workspace:dashboard";
export const WORKSPACE_FOLDER_TARGET = "workspace:folder";

/** Compatibility mapping, not a rule for the generic Card renderer. */
export function legacyWorkspaceCardNavigation(item: WorkspaceItem, pageType: string): CardNavigation | null {
    return pageType === "workspace" && item.type === "folder"
        ? { target: WORKSPACE_FOLDER_TARGET, params: { folderId: item.id } }
        : null;
}

/** Breadcrumbs are presentation data, not UI event handlers. */
export function legacyWorkspaceNavigation(
    currentFolderId: string | null,
    pageLabel: string,
    folderPath: WorkspaceItem[],
    homeLabel: string
): WorkspacePresentationNavigation {
    return {
        currentId: currentFolderId,
        parentId: folderPath.length > 1 ? folderPath[folderPath.length - 2].id : null,
        canGoBack: folderPath.length > 0,
        breadcrumbs: [
            { id: WORKSPACE_DASHBOARD_TARGET, label: homeLabel, targetId: WORKSPACE_DASHBOARD_TARGET },
            { id: WORKSPACE_ROOT_TARGET, label: pageLabel, targetId: WORKSPACE_ROOT_TARGET },
            ...folderPath.map((folder, index) => ({
                id: folder.id,
                label: folder.name,
                targetId: index === folderPath.length - 1 ? null : folder.id,
            })),
        ],
    };
}

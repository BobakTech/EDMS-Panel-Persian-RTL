/**
 * ============================================================================
 * Workspace Components
 * ----------------------------------------------------------------------------
 * Exposes reusable workspace components and types.
 * ============================================================================
 */

export { default as WorkspaceEmptyState } from "./WorkspaceEmptyState";
export { default as WorkspaceItemCard } from "./WorkspaceItemCard";
export { default as WorkspaceViewControls } from "./WorkspaceViewControls";
export { workspaceItemsMock } from "./workspace.mock";

export {
    getWorkspaceItemLabel,
    getWorkspaceItemUpdatedAtLabel,
} from "./workspace.helpers";

export { default as WorkspaceBreadcrumb } from "./WorkspaceBreadcrumb";
export { default as WorkspaceHeader } from "./WorkspaceHeader";

export type {
    WorkspaceItem,
    WorkspaceItemStatus,
    WorkspaceItemType,
    WorkspaceViewMode,
    WorkspacePageType,
    WorkspaceActionType,
    WorkspacePickedFile,
    WorkspaceCategoryDefinition,
} from "./workspace.types";

export {
    getWorkspaceItems,
    getWorkspaceCategoryDefinitions,
} from "./workspace.service";

export {
    getWorkspaceFileExtension,
    getWorkspaceFileSizeLabel,
} from "./workspace.helpers";

export {
    insertWorkspaceFiles,
    insertWorkspaceFolder,
    removeWorkspaceItem,
    updateWorkspaceItem,
} from "./workspace.operations";

export { default as WorkspaceItemDetailsPanel } from "./WorkspaceItemDetailsPanel";

/**
 * ============================================================================
 * Document Preview Export
 * ----------------------------------------------------------------------------
 * Exposes the workspace document preview panel.
 * ============================================================================
 */

export { default as WorkspaceDocumentPreviewPanel } from "./WorkspaceDocumentPreviewPanel";

export {
    getWorkspaceCategories,
    filterWorkspaceByCategory,
} from "./workspace.categories";

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
export { getWorkspaceItemLabel } from "./workspace.helpers";
export { default as WorkspaceBreadcrumb } from "./WorkspaceBreadcrumb";
export { default as WorkspaceHeader } from "./WorkspaceHeader";

export type {
    WorkspaceItem,
    WorkspaceItemType,
    WorkspaceViewMode,
} from "./workspace.types";

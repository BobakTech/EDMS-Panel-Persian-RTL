/**
 * ============================================================================
 * Workspace Helpers
 * ----------------------------------------------------------------------------
 * Provides shared helper functions for workspace-related UI and data.
 * ============================================================================
 */

import type { WorkspaceItemType } from "./workspace.types";

/**
 * ============================================================================
 * Item Helpers
 * ============================================================================
 */

export const getWorkspaceItemLabel = (type: WorkspaceItemType) =>
    type === "folder" ? "پوشه" : "PDF";
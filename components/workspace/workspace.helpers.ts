/**
 * ============================================================================
 * Workspace Helpers
 * ----------------------------------------------------------------------------
 * Provides shared helper functions for workspace-related UI and data.
 * ============================================================================
 */

import type { WorkspaceItem } from "./workspace.types";

/**
 * ============================================================================
 * Item Helpers
 * ============================================================================
 */

export const getWorkspaceItemLabel = (item: WorkspaceItem) => {
    if (item.type === "folder") {
        return "پوشه";
    }

    return item.extension?.toUpperCase() ?? "فایل";
};

export const getWorkspaceItemUpdatedAtLabel = (item: WorkspaceItem) =>
    item.type === "folder"
        ? `${item.childrenCount ?? 0} آیتم`
        : item.sizeLabel ?? "بدون حجم";
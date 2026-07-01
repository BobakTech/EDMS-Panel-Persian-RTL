/**
 * ============================================================================
 * Workspace Types
 * ----------------------------------------------------------------------------
 * Defines shared types used by workspace-related components.
 * ============================================================================
 */

export type WorkspaceViewMode = "grid" | "list";

export type WorkspaceItemType = "folder" | "file";

export interface WorkspaceItem {
    id: string;
    type: WorkspaceItemType;
    name: string;
    description: string;
    updatedAt: string;
}
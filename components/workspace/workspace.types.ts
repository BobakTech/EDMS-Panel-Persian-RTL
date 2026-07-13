/**
 * ============================================================================
 * Workspace Types
 * ----------------------------------------------------------------------------
 * Defines shared types used by workspace-related components.
 * ============================================================================
 */

export type WorkspaceViewMode = "grid" | "list";

export type WorkspaceItemType = "folder" | "file";

export type WorkspaceItemStatus = "active" | "archived" | "trashed";

export interface WorkspaceItem {
    id: string;
    type: WorkspaceItemType;
    name: string;
    description: string;
    updatedAt: string;
    status: WorkspaceItemStatus;
    extension?: string;
    sizeLabel?: string;
    childrenCount?: number;
    mimeType?: string;
    localUri?: string;
}

export interface WorkspacePickedFile {
    name: string;
    size?: number;
    mimeType?: string;
    uri?: string;
}

export type WorkspaceActionType = "upload" | "new-folder";
/**
 * ============================================================================
 * Workspace Types
 * ----------------------------------------------------------------------------
 * Defines shared workspace models, API response types, pagination queries,
 * and category metadata used by the EDMS workspace service layer.
 * ============================================================================
 */

export type WorkspaceViewMode = "grid" | "list";

export type WorkspacePageType = "workspace" | "archive" | "trash";

export type WorkspaceItemType = "folder" | "file";

export type WorkspaceItemStatus = "active" | "archived" | "trashed";

export interface WorkspaceItem {
    id: string;
    projectId?: string;

    type: WorkspaceItemType;

    name: string;
    description: string;
    ltrDescription?: string;

    updatedAt: string;
    status: WorkspaceItemStatus;

    isPinned?: boolean;

    parentFolderId?: string | null;

    extension?: string;

    sizeBytes?: number;
    sizeLabel?: string;

    childrenCount?: number;

    mimeType?: string;
    localUri?: string;

    /**
     * References WorkspaceCategoryDefinition.id.
     * Categories are metadata and remain independent from folders.
     */
    categoryId?: string;

    fileVersion?: string;
    fileDate?: string;
    fileTime?: string;
    fileTypeLabel?: string;
}

/**
 * File record returned by the files API.
 */
export interface WorkspaceFileApiItem {
    file_id: string;
    file_name: string;
    file_project: string;

    file_size: string;
    file_version: string;
    file_date: string;
    file_time: string;
    noe_file: string;

    file_parent: string | null;
    file_type: string;

    file_category: string | null;

    /**
     * Total available records for paginated responses.
     * A value of "-1" means the endpoint returned the complete result set.
     */
    cnt: string;
}

/**
 * File-category record returned by the categories API.
 */
export interface WorkspaceCategoryApiItem {
    d_t_id: string;
    d_t_name_fa: string;
    d_t_name_en: string;
    d_t_order: string;

    /**
     * May be "-1" when the endpoint returns the complete result set.
     */
    cnt: string;
}

/**
 * Normalized category metadata used inside EDMS.
 */
export interface WorkspaceCategoryDefinition {
    id: string;
    nameFa: string;
    nameEn: string;
    order: number;
}

/**
 * Optional workspace query values.
 *
 * from   Pagination offset.
 * cnt    Pagination limit.
 * search Server-side search value.
 */
export interface WorkspaceQuery {
    from?: number;
    cnt?: number;
    search?: string;
}

/**
 * Paginated workspace result returned by the service layer.
 */
export interface WorkspaceResult {
    items: WorkspaceItem[];
    total: number;
}

/**
 * Category model currently used by workspace category presentation logic.
 */
export interface WorkspaceCategory {
    id: string;
    nameFa: string;
    nameEn: string;
    foldersCount: number;
    filesCount: number;
}

/**
 * Locally selected/uploaded file before it becomes a WorkspaceItem.
 */
export interface WorkspacePickedFile {
    name: string;
    size?: number;
    mimeType?: string;
    uri?: string;
}

export type WorkspaceActionType = "upload" | "new-folder";
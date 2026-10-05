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
    projectCode?: string;
    contractNumber?: string;

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

    changeReason?: string;
    fileTypeId?: string;
    owner?: string;
    alternateFileName?: string;
    comment?: string;
    date?: string;
    task?: string;
    taskCode?: string;
    versionId?: string;
    referenceId?: string;
    mainSubject?: string;
    subSubject?: string;
    keywords?: string;
}

export interface WorkspaceItemUpdate {
    name?: string;
    fileVersion?: string;
    fileDate?: string;
    fileTime?: string;
    fileTypeLabel?: string;
    changeReason?: string;
    fileTypeId?: string;
    owner?: string;
    alternateFileName?: string;
    comment?: string;
    date?: string;
    task?: string;
    taskCode?: string;
    mainSubject?: string;
    subSubject?: string;
    keywords?: string;
    categoryId?: string;
    description?: string;
}

/**
 * File record returned by the files API.
 *
 * PMIS-specific field names remain isolated in the service layer and are
 * mapped into WorkspaceItem before being consumed by the EDMS UI.
 */
export interface WorkspaceFileApiItem {
    file_id: string;
    prj_id: string | null;

    name: string;
    change: string | null;
    ver: string;
    size: string;
    type: string;
    f_type: string | null;
    owner: string | null;

    no_code: string | null;
    date_code: string | null;
    comment: string | null;
    date: string;

    task: string | null;
    task_code: string | null;

    ver_id: string;
    ref_id: string;

    internal: string | null;
    Def: string | null;

    file_subject_main: string | null;
    file_subject_det: string | null;
    word: string | null;

    is_deleted: string;

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
 * sort   Server-side sort field.
 * order  Sort direction: 0 = ASC, 1 = DESC.
 */
export type WorkspaceSortField = "file_name" | "file_date" | "file_size";
export type WorkspaceSortOrder = 0 | 1;

export interface WorkspaceQuery {
    from?: number;
    cnt?: number;
    search?: string;
    sort?: WorkspaceSortField;
    order?: WorkspaceSortOrder;
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
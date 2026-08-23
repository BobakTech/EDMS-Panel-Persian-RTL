/**
 * ============================================================================
 * Project Types
 * ----------------------------------------------------------------------------
 * Defines shared types for project information loaded from the PHP API.
 * ============================================================================
 */

export interface ProjectFilterOption {
    id: string;
    projectName: string;
    projectCode: string;
    contractNumber: string;
}

export interface WorkspaceFilters {
    projectId: string | null;
    fileType: string | null;
}

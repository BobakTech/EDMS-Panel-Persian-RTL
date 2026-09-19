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
    projectIds: string[];
    fileTypes: string[];
}

export interface ProjectApiItem {
    project_id: string;
    project_name: string;
    project_short_name: string | null;
    project_contract_no: string | null;
}

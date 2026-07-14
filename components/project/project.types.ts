/**
 * ============================================================================
 * Project Types
 * ----------------------------------------------------------------------------
 * Defines shared types for project information loaded from the PHP API.
 * ============================================================================
 */

export interface ProjectInfo {
    id: string;
    projectName: string;
    projectCode?: string | null;
}

export interface ProjectInfoApiResponse {
    success: boolean;
    message: string;
    data: ProjectInfo | null;
}

export type ProjectInfoQueryParams = Record<
    string,
    string | number | boolean | null | undefined
>;

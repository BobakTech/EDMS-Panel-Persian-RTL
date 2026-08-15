/**
 * ============================================================================
 * Project Service
 * ----------------------------------------------------------------------------
 * Loads project information from the PHP backend API.
 * ============================================================================
 */

import type { ProjectInfo, ProjectInfoQueryParams } from "./project.types";

/**
 * ============================================================================
 * Config
 * ============================================================================
 */

const TEMPLATE_PROJECT: ProjectInfo = {
    id: "edms-template",
    projectName: "سامانه مدیریت اسناد سازمانی",
    projectCode: "EDMS-UI",
};

/**
 * ============================================================================
 * URL Builder
 * ============================================================================
 */

export async function getProjectInfo(
    _queryParams: ProjectInfoQueryParams = {},
): Promise<ProjectInfo> {
    return Promise.resolve(TEMPLATE_PROJECT);
}

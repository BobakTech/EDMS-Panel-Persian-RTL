/**
 * ============================================================================
 * Project Service
 * ----------------------------------------------------------------------------
 * Loads project information from the PHP backend API.
 * ============================================================================
 */

import type {
    ProjectInfo,
    ProjectInfoApiResponse,
    ProjectInfoQueryParams,
} from "./project.types";

/**
 * ============================================================================
 * Config
 * ============================================================================
 */

const PROJECT_INFO_API_URL = process.env.EXPO_PUBLIC_PROJECT_INFO_API_URL;

/**
 * ============================================================================
 * URL Builder
 * ============================================================================
 */

function buildProjectInfoApiUrl(
    queryParams: ProjectInfoQueryParams = {},
): string {
    if (!PROJECT_INFO_API_URL) {
        throw new Error("Project info API URL is not configured.");
    }

    const url = new URL(PROJECT_INFO_API_URL);

    Object.entries(queryParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return;
        }

        url.searchParams.set(key, String(value));
    });

    return url.toString();
}

/**
 * ============================================================================
 * Project Info
 * ============================================================================
 */

export async function getProjectInfo(
    queryParams: ProjectInfoQueryParams = {},
): Promise<ProjectInfo> {
    const apiUrl = buildProjectInfoApiUrl(queryParams);

    const response = await fetch(apiUrl);

    if (!response.ok) {
        throw new Error("Failed to load project info.");
    }

    const result = await response.json() as ProjectInfoApiResponse;

    if (!result.success || !result.data) {
        throw new Error(result.message || "Project info response is invalid.");
    }

    return result.data;
}

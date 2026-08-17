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

const PROJECT_INFO_API_URL =
    import.meta.env.VITE_PROJECT_INFO_API_URL ??
    import.meta.env.EXPO_PUBLIC_PROJECT_INFO_API_URL;

/**
 * ============================================================================
 * URL Builder
 * ============================================================================
 */

function buildProjectInfoUrl(queryParams: ProjectInfoQueryParams) {
    if (!PROJECT_INFO_API_URL) {
        throw new Error("Project info API URL is not configured.");
    }

    const url = new URL(PROJECT_INFO_API_URL, window.location.origin);

    Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            url.searchParams.set(key, String(value));
        }
    });

    return url.toString();
}

function isProjectInfo(value: unknown): value is ProjectInfo {
    if (!value || typeof value !== "object") {
        return false;
    }

    const candidate = value as Partial<ProjectInfo>;

    return (
        typeof candidate.id === "string" &&
        candidate.id.trim() !== "" &&
        typeof candidate.projectName === "string" &&
        candidate.projectName.trim() !== "" &&
        (candidate.projectCode === undefined ||
            candidate.projectCode === null ||
            typeof candidate.projectCode === "string")
    );
}

export async function getProjectInfo(
    queryParams: ProjectInfoQueryParams = {},
): Promise<ProjectInfo> {
    const response = await fetch(buildProjectInfoUrl(queryParams), {
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Project info request failed with status ${response.status}.`);
    }

    const payload = await response.json() as ProjectInfoApiResponse;

    if (!payload.success || !isProjectInfo(payload.data)) {
        throw new Error(payload.message || "Project info response is invalid.");
    }

    return payload.data;
}

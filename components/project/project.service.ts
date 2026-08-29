/**
 * ============================================================================
 * Project Service
 * ----------------------------------------------------------------------------
 * Provides project data access through the shared API transport layer.
 *
 * Keeps API communication separate from UI/filter components.
 * ============================================================================
 */

import { postApi } from "../../config/api.service";

import { projectServiceConfig } from "../../config/project.config";

import type {
    ProjectApiItem,
    ProjectFilterOption,
} from "./project.types";

/**
 * ============================================================================
 * Project Mapping
 * ----------------------------------------------------------------------------
 * Converts API project records into EDMS project filter models.
 * ============================================================================
 */

function mapProject(item: ProjectApiItem): ProjectFilterOption {
    return {
        id: item.project_id,
        projectName: item.project_name,
        projectCode: item.project_short_name ?? "",
        contractNumber: item.project_contract_no ?? "",
    };
}

/**
 * ============================================================================
 * Projects
 * ----------------------------------------------------------------------------
 * Loads available projects from API.
 * ============================================================================
 */

export async function getProjects(): Promise<ProjectFilterOption[]> {
    const projects = await postApi<ProjectApiItem[]>(
        projectServiceConfig.infoPath,
    );

    return projects.map(mapProject);
}

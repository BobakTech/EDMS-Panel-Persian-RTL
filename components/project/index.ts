/**
 * ============================================================================
 * Project Module
 * ----------------------------------------------------------------------------
 * Exposes project data services and shared types.
 * ============================================================================
 */

export { getProjectConnectionPresentation } from "./project.connection";
export { createDefaultWorkspaceFilters } from "./project.filters";
export { getProjects } from "./project.service";

export type {
    ProjectFilterOption,
    WorkspaceFilters,
} from "./project.types";

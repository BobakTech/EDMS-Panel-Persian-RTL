/**
 * ============================================================================
 * Project Module
 * ----------------------------------------------------------------------------
 * Exposes project data services and shared types.
 * ============================================================================
 */

export { checkProjectServiceConnection } from "./project.service";
export { getProjectConnectionPresentation } from "./project.connection";
export { createDefaultWorkspaceFilters } from "./project.filters";

export type {
    ProjectFilterOption,
    WorkspaceFilters,
} from "./project.types";

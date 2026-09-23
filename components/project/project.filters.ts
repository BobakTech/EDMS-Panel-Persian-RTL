import type { WorkspaceFilters } from "./project.types";

export function createDefaultWorkspaceFilters(): WorkspaceFilters {
    return {
        projectIds: [],
        fileTypes: [],
    };
}
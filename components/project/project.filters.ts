import type { WorkspaceFilters } from "./project.types";

export function createDefaultWorkspaceFilters(): WorkspaceFilters {
    return {
        projectId: null,
        fileType: null,
    };
}

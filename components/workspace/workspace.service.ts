/**
 * ============================================================================
 * Workspace Service
 * ----------------------------------------------------------------------------
 * Provides the workspace data access boundary.
 * Currently backed by mock data until API integration is available.
 * ============================================================================
 */

import { workspaceItemsMock } from "./workspace.mock";

import type { WorkspaceItem } from "./workspace.types";

/**
 * ============================================================================
 * Workspace Items
 * ============================================================================
 */

export function getWorkspaceItems(): WorkspaceItem[] {
    return workspaceItemsMock;
}
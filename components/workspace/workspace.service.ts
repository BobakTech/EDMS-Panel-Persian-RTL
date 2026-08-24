/**
 * ============================================================================
 * Workspace Service
 * ----------------------------------------------------------------------------
 * Provides the workspace data access boundary.
 * Uses API when configured, otherwise falls back to mock data.
 * ============================================================================
 */

import { workspaceServiceConfig } from "../../config/workspace.config";
import { workspaceItemsMock } from "./workspace.mock";

import type { WorkspaceItem } from "./workspace.types";

async function getWorkspaceItemsFromApi(): Promise<WorkspaceItem[]> {
    if (!workspaceServiceConfig.itemsUrl) {
        return workspaceItemsMock;
    }

    const response = await fetch(workspaceServiceConfig.itemsUrl, {
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(
            `Workspace request failed with status ${response.status}.`,
        );
    }

    return response.json();
}

export async function getWorkspaceItems(): Promise<WorkspaceItem[]> {
    return getWorkspaceItemsFromApi();
}
/**
 * ============================================================================
 * Workspace Service
 * ----------------------------------------------------------------------------
 * Loads and maps workspace files and file-category metadata through the shared
 * API transport layer.
 * ============================================================================
 */

import { postApi } from "../../config/api.service";
import { workspaceServiceConfig } from "../../config/workspace.config";

import { workspaceItemsMock } from "./workspace.mock";

import type {
    WorkspaceCategoryApiItem,
    WorkspaceCategoryDefinition,
    WorkspaceFileApiItem,
    WorkspaceItem,
    WorkspaceQuery,
    WorkspaceResult,
} from "./workspace.types";

/**
 * Converts an API file record into the EDMS workspace model.
 */
function mapWorkspaceFile(item: WorkspaceFileApiItem): WorkspaceItem {
    return {
        id: item.file_id,
        projectId: item.file_project,
        type: "file",
        name: item.file_name,
        description: item.file_name,
        updatedAt: item.file_date,
        status: "active",
        parentFolderId: null,
        mimeType: item.file_type,
        sizeLabel: item.file_size,
        categoryId: item.file_category ?? undefined,
        
        fileVersion: item.file_version,
        fileDate: item.file_date,
        fileTime: item.file_time,
        fileTypeLabel: item.noe_file,
    };
}

/**
 * Converts API category metadata into the EDMS category model.
 */
function mapWorkspaceCategory(
    item: WorkspaceCategoryApiItem,
): WorkspaceCategoryDefinition {
    return {
        id: item.d_t_id,
        nameFa: item.d_t_name_fa,
        nameEn: item.d_t_name_en,
        order: Number(item.d_t_order) || 0,
    };
}

/**
 * Extracts the total count returned by paginated endpoints.
 *
 * A negative count means the endpoint returned the complete result set and
 * therefore did not provide a separate total.
 */
function resolveTotal(
    items: WorkspaceFileApiItem[],
): number {
    if (items.length === 0) {
        return 0;
    }

    const total = Number(items[0].cnt);

    return Number.isFinite(total) && total >= 0
        ? total
        : items.length;
}

export async function getWorkspaceItems(
    query?: WorkspaceQuery,
): Promise<WorkspaceResult> {
    if (!workspaceServiceConfig.itemsPath) {
        return {
            items: workspaceItemsMock,
            total: workspaceItemsMock.length,
        };
    }

    const result = await postApi<WorkspaceFileApiItem[]>(
        workspaceServiceConfig.itemsPath,
        query,
    );

    return {
        items: result.map(mapWorkspaceFile),
        total: resolveTotal(result),
    };
}

export async function getWorkspaceCategories(): Promise<
    WorkspaceCategoryDefinition[]
> {
    const result = await postApi<WorkspaceCategoryApiItem[]>(
        workspaceServiceConfig.categoriesPath,
    );

    return result
        .map(mapWorkspaceCategory)
        .sort((a, b) => a.order - b.order);
}

export async function getWorkspaceCategoryDefinitions(): Promise<
    WorkspaceCategoryDefinition[]
> {
    const result = await postApi<WorkspaceCategoryApiItem[]>(
        workspaceServiceConfig.categoriesPath,
    );

    return result
        .map(mapWorkspaceCategory)
        .sort((a, b) => a.order - b.order);
}

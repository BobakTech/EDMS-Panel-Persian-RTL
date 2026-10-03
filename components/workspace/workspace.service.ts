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
 *
 * Project metadata such as Project Code and Contract Number is resolved
 * separately through the Projects API using projectId/prj_id.
 */
function mapWorkspaceFile(item: WorkspaceFileApiItem): WorkspaceItem {
    return {
        id: item.file_id,
        projectId: item.prj_id ?? undefined,

        type: "file",

        name: item.name,
        description: item.comment || item.name,
        updatedAt: item.date,

        status:
            item.is_deleted === "1"
                ? "trashed"
                : item.is_deleted === "2"
                    ? "archived"
                    : "active",

        parentFolderId: null,

        mimeType: item.type,
        sizeLabel: item.size,

        /**
         * f_type is the PMIS business file-type/category identifier.
         */
        categoryId: item.f_type ?? undefined,

        fileVersion: item.ver,
        fileDate: item.date_code ?? undefined,
        fileTypeLabel: item.f_type ?? undefined,

        changeReason: item.change || undefined,
        fileTypeId: item.f_type ?? undefined,
        owner: item.owner ?? undefined,
        alternateFileName: item.no_code ?? undefined,
        comment: item.comment || undefined,
        date: item.date,
        task: item.task ?? undefined,
        taskCode: item.task_code ?? undefined,
        versionId: item.ver_id,
        referenceId: item.ref_id,
        mainSubject: item.file_subject_main ?? undefined,
        subSubject: item.file_subject_det ?? undefined,
        keywords: item.word ?? undefined,
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
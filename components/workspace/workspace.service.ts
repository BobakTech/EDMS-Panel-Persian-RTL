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
 * Remembers the latest valid total for each server-side search.
 *
 * PMIS may return cnt=-1 after the first paginated request, so later pages
 * reuse the positive total previously returned for the same search.
 */
const workspaceTotals = new Map<string, number>();

function resolveTotal(
    items: WorkspaceFileApiItem[],
    query?: WorkspaceQuery,
): number {
    const isPaginated = query?.cnt !== undefined;
    const searchKey = query?.search?.trim() ?? "";
    const total = items.length > 0 ? Number(items[0].cnt) : -1;

    if (Number.isFinite(total) && total >= 0) {
        if (isPaginated) workspaceTotals.set(searchKey, total);
        return total;
    }

    if (!isPaginated) return items.length;

    return workspaceTotals.get(searchKey) ?? items.length;
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
        total: resolveTotal(result, query),
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
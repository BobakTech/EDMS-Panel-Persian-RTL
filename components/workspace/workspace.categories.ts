/**
 * ============================================================================
 * Workspace Categories
 * ----------------------------------------------------------------------------
 * Builds workspace category metadata from file category IDs and normalized
 * category definitions loaded separately from the API.
 *
 * Categories are metadata only and remain independent from user folders.
 * ============================================================================
 */

import type {
    WorkspaceCategory,
    WorkspaceCategoryDefinition,
    WorkspaceItem,
} from "./workspace.types";

const ALL_CATEGORY_ID = "all";

/**
 * Builds category entries and calculates counts from currently loaded items.
 */
export function getWorkspaceCategories(
    items: WorkspaceItem[],
    definitions: WorkspaceCategoryDefinition[] = [],
): WorkspaceCategory[] {
    const categories = new Map<string, WorkspaceCategory>();

    categories.set(ALL_CATEGORY_ID, {
        id: ALL_CATEGORY_ID,
        nameFa: "همه",
        nameEn: "All",
        foldersCount: countFolders(items),
        filesCount: countFiles(items),
    });

    definitions.forEach((definition) => {
        categories.set(definition.id, {
            id: definition.id,
            nameFa: definition.nameFa,
            nameEn: definition.nameEn,
            foldersCount: 0,
            filesCount: 0,
        });
    });

    items.forEach((item) => {
        if (!item.categoryId) {
            return;
        }

        if (!categories.has(item.categoryId)) {
            categories.set(item.categoryId, {
                id: item.categoryId,
                nameFa: item.categoryId,
                nameEn: item.categoryId,
                foldersCount: 0,
                filesCount: 0,
            });
        }

        const category = categories.get(item.categoryId)!;

        if (item.type === "folder") {
            category.foldersCount += 1;
        } else {
            category.filesCount += 1;
        }
    });

    return Array.from(categories.values());
}

/**
 * Filters loaded workspace items by category.
 */
export function filterWorkspaceByCategory(
    items: WorkspaceItem[],
    categoryId: string,
): WorkspaceItem[] {
    if (categoryId === ALL_CATEGORY_ID) {
        return items;
    }

    return items.filter((item) => item.categoryId === categoryId);
}

function countFolders(items: WorkspaceItem[]): number {
    return items.filter((item) => item.type === "folder").length;
}

function countFiles(items: WorkspaceItem[]): number {
    return items.filter((item) => item.type === "file").length;
}
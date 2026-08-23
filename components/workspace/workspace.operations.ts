import type { WorkspaceItem } from "./workspace.types";

export function insertWorkspaceFolder(
    items: WorkspaceItem[],
    folder: WorkspaceItem
): WorkspaceItem[] {
    const firstFileIndex = items.findIndex((item) => item.type === "file");
    const insertIndex = firstFileIndex === -1 ? items.length : firstFileIndex;

    return [
        ...items.slice(0, insertIndex),
        folder,
        ...items.slice(insertIndex),
    ];
}

export function insertWorkspaceFiles(
    items: WorkspaceItem[],
    files: WorkspaceItem[]
): WorkspaceItem[] {
    const lastFileIndex = items.findLastIndex((item) => item.type === "file");
    const insertIndex = lastFileIndex === -1 ? items.length : lastFileIndex + 1;

    return [
        ...items.slice(0, insertIndex),
        ...files,
        ...items.slice(insertIndex),
    ];
}

export function updateWorkspaceItem(
    items: WorkspaceItem[],
    itemId: string,
    update: (item: WorkspaceItem) => WorkspaceItem
): WorkspaceItem[] {
    return items.map((item) => item.id === itemId ? update(item) : item);
}

export function removeWorkspaceItem(
    items: WorkspaceItem[],
    itemId: string
): WorkspaceItem[] {
    return items.filter((item) => item.id !== itemId);
}

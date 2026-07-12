/**
 * ============================================================================
 * Workspace Mock Data
 * ----------------------------------------------------------------------------
 * Provides temporary workspace data until backend integration is available.
 * ============================================================================
 */

import type { WorkspaceItem } from "./workspace.types";

/**
 * ============================================================================
 * Mock Items
 * ============================================================================
 */

export const workspaceItemsMock: WorkspaceItem[] = [
    {
        id: "folder-001",
        type: "folder",
        name: "اسناد پروژه",
        description: "پوشه اصلی اسناد پروژه",
        updatedAt: "2026-07-11T08:00:00.000Z",
        status: "active",
        childrenCount: 12,
    },
    {
        id: "file-001",
        type: "file",
        name: "قرارداد اصلی",
        description: "فایل قرارداد تایید شده",
        updatedAt: "2026-07-10T14:30:00.000Z",
        status: "active",
        extension: "pdf",
        sizeLabel: "۲.۴ مگابایت",
    },
];
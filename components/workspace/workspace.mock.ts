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
        updatedAt: "به‌روزرسانی امروز",
    },
    {
        id: "file-001",
        type: "file",
        name: "قرارداد اصلی",
        description: "فایل قرارداد تایید شده",
        updatedAt: "به‌روزرسانی دیروز",
    },
];
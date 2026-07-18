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
        updatedAt: "2026-07-17T08:00:00.000Z",
        status: "active",
        parentFolderId: null,
        childrenCount: 3,
    },
    {
        id: "folder-002",
        type: "folder",
        name: "قراردادها",
        description: "مجموعه قراردادهای تأیید و امضا شده",
        updatedAt: "2026-07-16T12:20:00.000Z",
        status: "active",
        parentFolderId: null,
        childrenCount: 2,
    },
    {
        id: "folder-003",
        type: "folder",
        name: "گزارش‌های مالی",
        description: "گزارش‌ها و مستندات مالی پروژه",
        updatedAt: "2026-07-15T09:45:00.000Z",
        status: "active",
        parentFolderId: null,
        childrenCount: 2,
    },
    {
        id: "file-001",
        type: "file",
        name: "قرارداد اصلی",
        description: "فایل قرارداد تأیید شده",
        updatedAt: "2026-07-17T14:30:00.000Z",
        status: "active",
        parentFolderId: "folder-002",
        extension: "pdf",
        sizeLabel: "۲.۴ مگابایت",
    },
    {
        id: "file-002",
        type: "file",
        name: "صورتجلسه تحویل",
        description: "صورتجلسه نهایی تحویل مدارک",
        updatedAt: "2026-07-16T16:10:00.000Z",
        status: "active",
        parentFolderId: "folder-001",
        extension: "docx",
        sizeLabel: "۷۸۰ کیلوبایت",
    },
    {
        id: "file-003",
        type: "file",
        name: "برنامه زمان‌بندی",
        description: "فایل زمان‌بندی اجرای پروژه",
        updatedAt: "2026-07-15T18:25:00.000Z",
        status: "active",
        parentFolderId: "folder-001",
        extension: "xlsx",
        sizeLabel: "۱.۱ مگابایت",
    },
    {
        id: "file-004",
        type: "file",
        name: "گزارش پرداخت تیر",
        description: "گزارش پرداخت و وضعیت مالی تیرماه",
        updatedAt: "2026-07-14T11:00:00.000Z",
        status: "active",
        parentFolderId: "folder-003",
        extension: "pdf",
        sizeLabel: "۱.۸ مگابایت",
    },
    {
        id: "file-005",
        type: "file",
        name: "پیوست فنی قرارداد",
        description: "پیوست فنی مرتبط با قرارداد اصلی",
        updatedAt: "2026-07-13T10:15:00.000Z",
        status: "active",
        parentFolderId: "folder-002",
        extension: "pdf",
        sizeLabel: "۳.۲ مگابایت",
    },
    {
        id: "file-006",
        type: "file",
        name: "بودجه پیشنهادی",
        description: "نسخه اولیه بودجه پیشنهادی پروژه",
        updatedAt: "2026-07-12T13:40:00.000Z",
        status: "archived",
        parentFolderId: null,
        extension: "xlsx",
        sizeLabel: "۹۵۰ کیلوبایت",
    },
    {
        id: "file-007",
        type: "file",
        name: "نسخه قدیمی قرارداد",
        description: "نسخه قبلی قرارداد که دیگر استفاده نمی‌شود",
        updatedAt: "2026-07-11T08:30:00.000Z",
        status: "trashed",
        parentFolderId: null,
        extension: "pdf",
        sizeLabel: "۲.۱ مگابایت",
    },
];

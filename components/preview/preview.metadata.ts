/**
 * ============================================================================
 * Preview Metadata
 * ----------------------------------------------------------------------------
 * Centralizes document-preview metadata and status presentation so inline and
 * full-screen preview surfaces always render the same current WorkspaceItem.
 * ============================================================================
 */

import type { TranslationKey } from "../../locales";
import type { WorkspaceItem } from "../workspace/workspace.types";
import {
    getWorkspaceFileExtension,
    getWorkspaceItemStatusLabel,
    getWorkspaceItemUpdatedAtLabel,
} from "../workspace/workspace.helpers";

type Translate = (key: TranslationKey) => string;
type PreviewLanguage = Parameters<typeof getWorkspaceItemUpdatedAtLabel>[2];

export interface PreviewMetadataEntry {
    key: "extension" | "size" | "version" | "date" | "time" | "fileType";
    label: string;
    value: string;
}

export interface PreviewStatusPresentation {
    label: string;
    value: string;
    foregroundColor: string;
    backgroundColor: string;
    borderColor: string;
}

export interface PreviewMetadataPresentation {
    entries: PreviewMetadataEntry[];
    status: PreviewStatusPresentation;
}

function getStatusPalette(status: WorkspaceItem["status"]) {
    const foregroundColor =
        status === "active"
            ? "#16a34a"
            : status === "archived"
                ? "#d97706"
                : "#dc2626";

    return {
        foregroundColor,
        backgroundColor: `color-mix(in srgb, ${foregroundColor} 12%, transparent)`,
        borderColor: `color-mix(in srgb, ${foregroundColor} 42%, transparent)`,
    };
}

function formatFileVersion(value?: string): string {
    const normalizedValue = value?.trim();

    if (!normalizedValue) {
        return "-";
    }

    const numericValue = Number(normalizedValue);

    return Number.isFinite(numericValue)
        ? numericValue.toFixed(2)
        : normalizedValue;
}

export function getPreviewMetadataPresentation(
    item: WorkspaceItem,
    direction: "rtl" | "ltr",
    t: Translate,
    language: PreviewLanguage,
): PreviewMetadataPresentation {
    const extension =
        item.type === "file"
            ? (
                item.extension ??
                getWorkspaceFileExtension(item.name)
            ).toUpperCase()
            : t("folder");

    const rawSize =
        getWorkspaceItemUpdatedAtLabel(item, t, language);

    const size =
        item.type === "file" &&
            /^\d+(?:[.,]\d+)?$/.test(rawSize.trim())
            ? `${rawSize} MB`
            : rawSize;

    const statusPalette = getStatusPalette(item.status);

    const entries: PreviewMetadataEntry[] = [
        {
            key: "extension",
            label: direction === "ltr" ? "Extension" : "پسوند",
            value: extension || "-",
        },
        {
            key: "size",
            label: direction === "ltr" ? "Size" : "حجم",
            value: size || "-",
        },
    ];

    if (item.type === "file") {
        entries.push(
            {
                key: "version",
                label: direction === "ltr" ? "Version" : "نسخه",
                value: formatFileVersion(item.fileVersion),
            },
            {
                key: "date",
                label: direction === "ltr" ? "Date" : "تاریخ",
                value: item.fileDate?.trim() || "-",
            },
            {
                key: "time",
                label: direction === "ltr" ? "Time" : "زمان",
                value: item.fileTime?.trim() || "-",
            },
            {
                key: "fileType",
                label: direction === "ltr" ? "File Type" : "نوع فایل",
                value: item.fileTypeLabel?.trim() || "-",
            },
        );
    }

    return {
        entries,
        status: {
            label: direction === "ltr" ? "Status" : t("status"),
            value: getWorkspaceItemStatusLabel(item, direction, t),
            ...statusPalette,
        },
    };
}

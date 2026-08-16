/**
 * ============================================================================
 * Workspace Helpers
 * ----------------------------------------------------------------------------
 * Provides shared helper functions for workspace-related UI and data.
 * ============================================================================
 */

import type { WorkspaceItem } from "./workspace.types";
import type { Language, LayoutDirection, TranslationKey } from "../../locales";

type Translate = (key: TranslationKey) => string;

/**
 * ============================================================================
 * Item Helpers
 * ============================================================================
 */

export const getWorkspaceItemLabel = (item: WorkspaceItem, t: Translate) => {
    if (item.type === "folder") {
        return t("folder");
    }

    return item.extension?.toUpperCase() ?? t("file");
};

export const getWorkspaceItemDescription = (
    item: WorkspaceItem,
    direction: LayoutDirection
) => direction === "ltr" && item.ltrDescription
    ? item.ltrDescription
    : item.description;

export const getWorkspaceItemStatusLabel = (
    item: WorkspaceItem,
    direction: LayoutDirection,
    t: Translate
) => {
    if (direction === "ltr") {
        if (item.status === "archived") {
            return "Archived";
        }

        if (item.status === "trashed") {
            return "Trash";
        }

        return "Active";
    }

    if (item.status === "archived") {
        return t("archived");
    }

    if (item.status === "trashed") {
        return t("trash");
    }

    return t("active");
};

export const getWorkspaceItemUpdatedAtLabel = (
    item: WorkspaceItem,
    t: Translate,
    language: Language
) => {
    if (item.type === "folder") {
        return `${new Intl.NumberFormat(language).format(item.childrenCount ?? 0)} ${t("items")}`;
    }

    if (!item.sizeBytes) {
        return item.sizeLabel ?? t("unknown");
    }

    const isMegabytes = item.sizeBytes >= 1024 * 1024;
    const size = isMegabytes
        ? item.sizeBytes / (1024 * 1024)
        : Math.max(1, item.sizeBytes / 1024);
    const formattedSize = new Intl.NumberFormat(language, {
        maximumFractionDigits: 1,
    }).format(size);

    return `${formattedSize} ${t(isMegabytes ? "megabytesShort" : "kilobytesShort")}`;
};

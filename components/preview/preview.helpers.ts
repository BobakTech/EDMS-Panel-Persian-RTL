import type { WorkspaceItem } from "../workspace";

export type PreviewRendererKind =
    | "pdf"
    | "image"
    | "office"
    | "text"
    | "generic";

const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
const textExtensions = ["txt", "md", "csv", "json", "xml", "log"];
const officeExtensions = [
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "odt",
    "ods",
    "odp",
];

export function getNormalizedFileExtension(item: WorkspaceItem) {
    return item.extension?.replace(".", "").toLowerCase() ?? "";
}

export function getWorkspaceFileTypeLabel(item: WorkspaceItem, fallback: string) {
    const extension = getNormalizedFileExtension(item);
    return extension ? extension.toUpperCase() : fallback;
}

export function getPreviewRendererKind(item: WorkspaceItem): PreviewRendererKind {
    const extension = getNormalizedFileExtension(item);
    const mimeType = item.mimeType?.toLowerCase() ?? "";

    if (extension === "pdf" || mimeType.includes("pdf")) {
        return "pdf";
    }

    if (mimeType.startsWith("image/") || imageExtensions.includes(extension)) {
        return "image";
    }

    if (mimeType.startsWith("text/") || textExtensions.includes(extension)) {
        return "text";
    }

    if (
        officeExtensions.includes(extension) ||
        ["word", "excel", "powerpoint", "spreadsheet", "presentation"]
            .some((value) => mimeType.includes(value))
    ) {
        return "office";
    }

    return "generic";
}

export function hasRenderableWorkspacePreview(item: WorkspaceItem) {
    const kind = getPreviewRendererKind(item);
    return Boolean(item.localUri) && (kind === "image" || kind === "pdf");
}

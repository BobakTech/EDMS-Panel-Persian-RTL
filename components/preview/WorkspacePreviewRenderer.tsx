import type { ReactNode } from "react";
import { Image, type ImageStyle } from "../../web/ui";
import type { WorkspaceItem } from "../workspace";
import PdfPreviewRenderer from "./PdfPreviewRenderer.web";
import { getPreviewRendererKind } from "./preview.helpers";

interface WorkspacePreviewRendererProps {
    item: WorkspaceItem;
    imageStyle: ImageStyle | ImageStyle[];
    pdfHeight: number;
    borderColor: string;
    fallback: ReactNode;
}

export default function WorkspacePreviewRenderer({
    item,
    imageStyle,
    pdfHeight,
    borderColor,
    fallback,
}: WorkspacePreviewRendererProps) {
    const kind = getPreviewRendererKind(item);

    if (kind === "image" && item.localUri) {
        return (
            <Image
                source={{ uri: item.localUri }}
                resizeMode="contain"
                style={imageStyle}
            />
        );
    }

    if (kind === "pdf" && item.localUri) {
        return (
            <PdfPreviewRenderer
                uri={item.localUri}
                title={item.name}
                height={pdfHeight}
                borderColor={borderColor}
            />
        );
    }

    return <>{fallback}</>;
}

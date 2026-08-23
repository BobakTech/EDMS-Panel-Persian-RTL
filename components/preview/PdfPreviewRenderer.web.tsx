import type { CSSProperties } from "react";
import { StyleSheet, View } from "../../web/ui";

interface PdfPreviewRendererProps {
    uri: string;
    title: string;
    height: number;
    borderColor: string;
}

export default function PdfPreviewRenderer({
    uri,
    title,
    height,
    borderColor,
}: PdfPreviewRendererProps) {
    const previewUri = `${uri}${uri.includes("#") ? "&" : "#"}view=FitH&toolbar=1&navpanes=0`;
    const frameStyle: CSSProperties = {
        width: "100%",
        height,
        display: "block",
        border: 0,
        backgroundColor: "#FFFFFF",
    };

    return (
        <View style={[styles.container, { height, borderColor }]}>
            <iframe
                src={previewUri}
                title={title}
                style={frameStyle}
                allow="fullscreen"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        minWidth: 0,
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
        borderWidth: 1,
        borderRadius: 8,
    },
});

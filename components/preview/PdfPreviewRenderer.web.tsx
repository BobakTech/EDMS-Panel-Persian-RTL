import type { CSSProperties } from "react";
import { StyleSheet, View } from "react-native";

interface PdfPreviewRendererProps {
    uri: string;
    title: string;
    height: number;
    backgroundColor: string;
    borderColor: string;
}

export default function PdfPreviewRenderer({
    uri,
    title,
    height,
    backgroundColor,
    borderColor,
}: PdfPreviewRendererProps) {
    const frameStyle: CSSProperties = {
        width: "100%",
        height,
        display: "block",
        border: 0,
        backgroundColor,
    };

    return (
        <View style={[styles.container, { height, borderColor }]}>
            <iframe src={uri} title={title} style={frameStyle} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        overflow: "hidden",
        borderWidth: 1,
        borderRadius: 8,
    },
});
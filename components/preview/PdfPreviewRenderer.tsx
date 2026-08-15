import { Linking, Pressable, StyleSheet, Text, View } from "../../web/ui";

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
    return (
        <View style={[styles.container, { minHeight: height, backgroundColor, borderColor }]}>
            <Text style={styles.message}>پیش‌نمایش PDF در نسخه وب در دسترس است.</Text>
            <Pressable onPress={() => void Linking.openURL(uri)} style={styles.button}>
                <Text style={styles.buttonText}>{title}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 16,
        borderWidth: 1,
        borderRadius: 8,
    },
    message: {
        textAlign: "center",
    },
    button: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    buttonText: {
        fontWeight: "600",
    },
});

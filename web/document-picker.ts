export type DocumentPickerAsset = {
    name: string;
    uri: string;
    size?: number;
    mimeType?: string;
};

export async function getDocumentAsync(_options?: { copyToCacheDirectory?: boolean; multiple?: boolean }): Promise<
    | { canceled: true; assets: [] }
    | { canceled: false; assets: [DocumentPickerAsset] }
> {
    return new Promise((resolve) => {
        const input = document.createElement("input");
        input.type = "file";
        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) {
                resolve({ canceled: true, assets: [] });
                return;
            }
            resolve({
                canceled: false,
                assets: [{ name: file.name, uri: URL.createObjectURL(file), size: file.size, mimeType: file.type }],
            });
        };
        input.addEventListener("cancel", () => resolve({ canceled: true, assets: [] }), { once: true });
        input.click();
    });
}

import type { TranslationKey } from "../../locales";

type Translate = (key: TranslationKey) => string;

export interface ProjectConnectionPresentation {
    color: string;
    icon: string;
    label: string;
    shortLabel: string;
}

export function getProjectConnectionPresentation(
    t: Translate,
    isLoading: boolean,
    error: string | null,
): ProjectConnectionPresentation {
    if (isLoading) {
        return {
            color: "#F59E0B",
            icon: "cloud-cog",
            label: t("projectConnectionConnecting"),
            shortLabel: t("connectionConnectingShort"),
        };
    }

    if (error) {
        return {
            color: "#EF4444",
            icon: "cloud-off",
            label: t("projectConnectionFailed"),
            shortLabel: t("connectionUnavailableShort"),
        };
    }

    return {
        color: "#22C55E",
        icon: "cloud",
        label: t("projectConnectionConnected"),
        shortLabel: t("connectionConnectedShort"),
    };
}

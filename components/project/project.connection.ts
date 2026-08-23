import type { TranslationKey } from "../../locales";
import { semanticColors } from "../../theme";

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
            color: semanticColors.warning,
            icon: "cloud-cog",
            label: t("projectConnectionConnecting"),
            shortLabel: t("connectionConnectingShort"),
        };
    }

    if (error) {
        return {
            color: semanticColors.error,
            icon: "cloud-off",
            label: t("projectConnectionFailed"),
            shortLabel: t("connectionUnavailableShort"),
        };
    }

    return {
        color: semanticColors.success,
        icon: "cloud",
        label: t("projectConnectionConnected"),
        shortLabel: t("connectionConnectedShort"),
    };
}

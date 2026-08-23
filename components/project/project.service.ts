/**
 * ============================================================================
 * Project Service
 * ----------------------------------------------------------------------------
 * Checks whether the configured project web service is reachable.
 * ============================================================================
 */

import { projectServiceConfig } from "./project.config";

/**
 * ============================================================================
 * URL Builder
 * ============================================================================
 */

function getProjectServiceUrl() {
    if (!projectServiceConfig.infoUrl) {
        throw new Error("Project info API URL is not configured.");
    }

    return new URL(projectServiceConfig.infoUrl, window.location.origin).toString();
}

export async function checkProjectServiceConnection(): Promise<void> {
    const formData = new FormData();
    formData.append("tok", "hcc");

    const response = await fetch(getProjectServiceUrl(), {
        method: "POST",
        body: formData,
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Project info request failed with status ${response.status}.`);
    }
}

/**
 * ============================================================================
 * Project Service
 * ----------------------------------------------------------------------------
 * Checks whether the configured project web service is reachable.
 * ============================================================================
 */

/**
 * ============================================================================
 * Config
 * ============================================================================
 */

const PROJECT_INFO_API_URL =
    import.meta.env.VITE_PROJECT_INFO_API_URL;

/**
 * ============================================================================
 * URL Builder
 * ============================================================================
 */

function getProjectServiceUrl() {
    if (!PROJECT_INFO_API_URL) {
        throw new Error("Project info API URL is not configured.");
    }

    return new URL(PROJECT_INFO_API_URL, window.location.origin).toString();
}

export async function checkProjectServiceConnection(): Promise<void> {
    const response = await fetch(getProjectServiceUrl(), {
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Project info request failed with status ${response.status}.`);
    }

}

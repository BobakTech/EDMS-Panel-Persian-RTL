/**
 * ============================================================================
 * API Service
 * ----------------------------------------------------------------------------
 * Provides shared HTTP request handling for application services.
 *
 * Keeps transport rules centralized:
 * - Base URL handling
 * - Required API fields
 * - Optional pagination/search parameters
 *
 * Feature services should only provide endpoint-specific data.
 * ============================================================================
 */

import { apiConfig } from "./api.config";

export interface ApiQuery {
    from?: number;
    cnt?: number;
    search?: string;
}

interface ApiRequestOptions extends ApiQuery {
    tok: string;
}

function createFormData(options: ApiRequestOptions): FormData {
    const formData = new FormData();

    Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            formData.append(key, String(value));
        }
    });

    return formData;
}

export async function postApi<T>(
    endpoint: string,
    query?: ApiQuery,
): Promise<T> {
    if (!apiConfig.baseUrl) {
        throw new Error("API base URL is not configured.");
    }

    const formData = createFormData({
        tok: "hcc",
        from: query?.from,
        cnt: query?.cnt,
        search: query?.search,
    });

    const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
            Accept: "application/json",
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(
            `API request failed with status ${response.status}.`,
        );
    }

    return response.json();
}
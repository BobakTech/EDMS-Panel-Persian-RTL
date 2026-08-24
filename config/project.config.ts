/**
 * Project service configuration sourced from the Vite environment.
 * Keeping this separate lets the service remain focused on transport behavior.
 */
export const projectServiceConfig = {
    infoUrl: import.meta.env.VITE_PROJECT_INFO_API_URL,
};

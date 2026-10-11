
import type { Card } from "./Card";

/**
 * Generic workspace presentation contract.
 *
 * Describes what the UI should display, not how PMIS stores its data.
 * Presentation levels and navigation are independent of business entities.
 */

export type WorkspaceEnvironment = string;
export type WorkspacePresentationId = string;
export type WorkspaceActionId = string;

export interface WorkspacePresentationAction {
    id: WorkspaceActionId;
    label?: string;
    icon?: string;
    visible?: boolean;
    disabled?: boolean;
    properties?: Record<string, unknown>;
}

export interface WorkspacePresentationBreadcrumb {
    id: WorkspacePresentationId;
    label: string;
    targetId?: WorkspacePresentationId | null;
    disabled?: boolean;
    properties?: Record<string, unknown>;
}

export interface WorkspacePresentationNavigation {
    currentId: WorkspacePresentationId | null;
    parentId?: WorkspacePresentationId | null;
    canGoBack?: boolean;
    breadcrumbs: WorkspacePresentationBreadcrumb[];
}

export interface WorkspacePresentationPagination {
    page: number;
    pageSize: number;
    totalItems: number;
}

export interface WorkspacePresentation {
    id: WorkspacePresentationId;
    environment: WorkspaceEnvironment;

    /** Presentation level of the currently displayed collection. */
    level: number;

    /** Already resolved cards, in their intended display order. */
    cards: Card[];

    /** Navigation supplied by the presentation controller. */
    navigation: WorkspacePresentationNavigation;

    /** Pagination metadata for the complete logical collection. */
    pagination: WorkspacePresentationPagination;

    /** Available workspace-level actions. */
    actions: WorkspacePresentationAction[];

    title?: string;
    subtitle?: string;
    loading?: boolean;
    error?: string | null;
    properties?: Record<string, unknown>;
}

import { Card } from "./Card";
import type { CardData } from "./Card";
import type {
    WorkspacePresentation,
    WorkspacePresentationAction,
    WorkspacePresentationBreadcrumb,
    WorkspacePresentationNavigation,
    WorkspacePresentationPagination,
} from "./workspace.presentation";

/** All presentation hierarchy and configuration must be supplied explicitly. */
export interface WorkspacePresentationConfig {
    id: string;
    environment: string;
    level: number;
    cards: Card[];
    navigation: WorkspacePresentationNavigation;
    pagination: WorkspacePresentationPagination;
    actions?: WorkspacePresentationAction[];
    title?: string;
    subtitle?: string;
    loading?: boolean;
    error?: string | null;
    properties?: Record<string, unknown>;
    defaults?: Partial<CardData>;
    levels?: Record<number, Partial<CardData>>;
    types?: Record<string, Partial<CardData>>;
    overrides?: Record<string, Partial<CardData>>;
}

/** Clone only explicitly supplied fields; absent fields must not reset Card state. */
function copyCardData(data: Partial<CardData>): Partial<CardData> {
    const result: Partial<CardData> = { ...data };
    if (data.capabilities !== undefined) result.capabilities = data.capabilities.map((item) => ({ ...item }));
    if (data.navigation !== undefined) result.navigation = data.navigation
        ? { ...data.navigation, params: data.navigation.params ? { ...data.navigation.params } : undefined }
        : null;
    if (data.classNames !== undefined) result.classNames = [...data.classNames];
    if (data.properties !== undefined) result.properties = { ...data.properties };
    return result;
}

/** Priority: original Card → workspace → level → type → object. */
export function resolvePresentationCard(card: Card, config: WorkspacePresentationConfig): Card {
    const workspaceDefaults = copyCardData(config.defaults ?? {});
    const base = card.withOverrides({ environment: config.environment, ...workspaceDefaults });
    const levelDefaults = copyCardData(config.levels?.[base.level] ?? {});
    const afterLevel = base.withOverrides(levelDefaults);
    const typeDefaults = copyCardData(config.types?.[afterLevel.type] ?? {});
    const afterType = afterLevel.withOverrides(typeDefaults);
    const objectOverrides = copyCardData(config.overrides?.[card.id] ?? {});
    return afterType.withOverrides(objectOverrides);
}

function copyBreadcrumbs(items: WorkspacePresentationBreadcrumb[]): WorkspacePresentationBreadcrumb[] {
    return items.map((item) => ({
        ...item,
        properties: item.properties ? { ...item.properties } : undefined,
    }));
}

/** Pure controller: no React state, API calls, PMIS inference, or action execution. */
export function createWorkspacePresentation(config: WorkspacePresentationConfig): WorkspacePresentation {
    if (!Number.isInteger(config.level) || config.level < 0) {
        throw new Error("Workspace presentation level must be a non-negative integer.");
    }
    if (!Number.isInteger(config.pagination.page) || config.pagination.page < 1 ||
        !Number.isInteger(config.pagination.pageSize) || config.pagination.pageSize < 1 ||
        !Number.isInteger(config.pagination.totalItems) || config.pagination.totalItems < 0) {
        throw new Error("Invalid workspace presentation pagination.");
    }

    const cards = config.cards
        .map((card) => resolvePresentationCard(card, config))
        .filter((card) => card.visible);

    return {
        id: config.id,
        environment: config.environment,
        level: config.level,
        cards,
        navigation: {
            ...config.navigation,
            breadcrumbs: copyBreadcrumbs(config.navigation.breadcrumbs),
        },
        pagination: { ...config.pagination },
        actions: (config.actions ?? []).map((action) => ({
            ...action,
            properties: action.properties ? { ...action.properties } : undefined,
        })),
        title: config.title,
        subtitle: config.subtitle,
        loading: config.loading ?? false,
        error: config.error ?? null,
        properties: { ...(config.properties ?? {}) },
    };
}

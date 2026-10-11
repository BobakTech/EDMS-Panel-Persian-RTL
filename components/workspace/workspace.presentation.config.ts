import type { CardData } from "./Card";
import type { WorkspacePresentationConfig } from "./workspace.presentation.controller";

/**
 * Presentation-only configuration. No PMIS entities, API calls, or hierarchy inference.
 * Add environment/level/type/object rules here; leave unspecified fields unchanged.
 */
export type WorkspaceCardPresentationRules = Pick<WorkspacePresentationConfig, "defaults" | "levels" | "types" | "overrides">;

export const workspaceCardPresentationRules: WorkspaceCardPresentationRules = {
    defaults: {},
    levels: {},
    types: {},
    overrides: {},
};

/** Merge caller-supplied presentation rules without mutating shared defaults. */
export function configureWorkspaceCards(rules: WorkspaceCardPresentationRules = {}): WorkspaceCardPresentationRules {
    return {
        defaults: { ...workspaceCardPresentationRules.defaults, ...rules.defaults },
        levels: { ...workspaceCardPresentationRules.levels, ...rules.levels },
        types: { ...workspaceCardPresentationRules.types, ...rules.types },
        overrides: { ...workspaceCardPresentationRules.overrides, ...rules.overrides },
    };
}

/** Optional type helper for callers constructing explicit per-card overrides. */
export type WorkspaceCardOverrides = Record<string, Partial<CardData>>;

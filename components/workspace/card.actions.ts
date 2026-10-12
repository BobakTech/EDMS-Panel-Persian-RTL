import type { Card, CardCapability, CardNavigation } from "./Card";

/** A presentation action is descriptive; it never performs a PMIS operation. */
export type CardActionId = string;

/** Identifies an action invocation without assuming any backend entity type. */
export interface CardActionRequest {
    cardId: string;
    actionId: CardActionId;
    params?: Record<string, unknown>;
    navigation?: CardNavigation | null;
}

/** Context is supplied by the caller, not inferred from card type or hierarchy. */
export interface CardActionContext {
    card: Card;
    request: CardActionRequest;
}

/** External application code owns side effects, authorization, and routing. */
export type CardActionHandler = (context: CardActionContext) => void | Promise<void>;
export type CardActionDispatcher = (context: CardActionContext) => void | Promise<void>;

/** Optional action handlers are registered outside the Card presentation model. */
export type CardActionHandlers = Record<CardActionId, CardActionHandler>;

/** Resolve a declared capability; missing actions are not implicitly permitted. */
export function getCardActionCapability(card: Card, actionId: CardActionId): CardCapability | null {
    return card.capabilities.find((capability) => capability.id === actionId) ?? null;
}

/** Check capability independently of the actual action implementation. */
export function isCardActionAvailable(card: Card, actionId: CardActionId): boolean {
    return card.can(actionId);
}

/**
 * Application-boundary compatibility policy.
 * Undeclared actions are permitted only when the caller explicitly identifies
 * a legacy-backed card; generic presentation cards always require capabilities.
 * This is a UI policy, not backend authorization.
 */
export function canInvokeCardAction(card: Card | null | undefined, actionId: CardActionId, legacyBacked = false): boolean {
    if (!card || card.disabled || !card.visible) return false;
    if (card.capabilities.length === 0) return legacyBacked;
    return isCardActionAvailable(card, actionId);
}

/** Build a request without executing it; the application chooses the dispatcher. */
export function createCardActionRequest(card: Card, actionId: CardActionId, params?: Record<string, unknown>): CardActionRequest {
    return {
        cardId: card.id,
        actionId,
        ...(params ? { params: { ...params } } : {}),
        ...(actionId === "open" && card.navigation ? { navigation: { ...card.navigation, params: card.navigation.params ? { ...card.navigation.params } : undefined } } : {}),
    };
}

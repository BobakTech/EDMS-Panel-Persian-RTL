import { Card } from "./Card";
import type { CardData } from "./Card";
import type { WorkspaceItem } from "./workspace.types";

/**
 * Maps an existing workspace item to the generic presentation model.
 * Presentation settings are supplied by the caller, not inferred from PMIS entities.
 * This compatibility adapter does not change the source item or API contract.
 */
export function mapWorkspaceItemToCard(item: WorkspaceItem, presentation: Partial<CardData> = {}): Card {
    return new Card({
        id: item.id,
        name: item.name,
        type: item.type,
        level: 0,
        parentId: item.parentFolderId ?? null,
        size: item.sizeLabel ?? "",
        extension: item.extension ?? "",
        childrenCount: item.childrenCount ?? 0,
        ...presentation,
    });
}

/** Generic, data-driven card presentation model. No PMIS-specific logic. */
export type CardType = string;

/** Describes an available action and its optional presentation metadata. */
export interface CardCapability {
    id: string;
    enabled?: boolean;
    visible?: boolean;
    label?: string;
    icon?: string;
}

export interface CardNavigation { target: string; params?: Record<string, unknown>; }

export interface CardData {
    id: string;
    name: string;
    type: CardType;
    level?: number;
    environment?: string;
    parentId?: string | null;
    size?: string;
    extension?: string;
    color?: string;
    icon?: string;
    footer?: string;
    childrenCount?: number;
    keyword?: string;
    capabilities?: CardCapability[];
    navigation?: CardNavigation | null;
    visible?: boolean;
    disabled?: boolean;
    classNames?: string[];
    properties?: Record<string, unknown>;
}

/** Presentation model. API mapping, navigation execution, and rendering are separate. */
export class Card {
    readonly id: string;
    readonly type: CardType;
    name: string;
    level: number;
    environment: string;
    parentId: string | null;
    size: string;
    extension: string;
    color?: string;
    icon?: string;
    footer?: string;
    childrenCount: number;
    keyword: string;
    capabilities: CardCapability[];
    navigation: CardNavigation | null;
    visible: boolean;
    disabled: boolean;
    classNames: string[];
    properties: Record<string, unknown>;

    constructor(data: CardData) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.level = data.level ?? 0;
        this.environment = data.environment ?? "workspace";
        this.parentId = data.parentId ?? null;
        this.size = data.size ?? "";
        this.extension = data.extension ?? "";
        this.color = data.color;
        this.icon = data.icon;
        this.footer = data.footer;
        this.childrenCount = data.childrenCount ?? 0;
        this.keyword = data.keyword ?? "";
        this.capabilities = (data.capabilities ?? []).map((item) => ({ ...item }));
        this.navigation = data.navigation ? { ...data.navigation, params: data.navigation.params ? { ...data.navigation.params } : undefined } : null;
        this.visible = data.visible ?? true;
        this.disabled = data.disabled ?? false;
        this.classNames = [...(data.classNames ?? [])];
        this.properties = { ...(data.properties ?? {}) };
    }

    /** CSS classes describe environment, visual type, and presentation level. */
    get cssClassName(): string {
        return [...new Set([this.environment, this.type, `level${this.level}`, ...this.classNames].filter(Boolean))].join(" ");
    }

    /** Descriptive permissions only; backend authorization remains authoritative. */
    can(actionId: string): boolean {
        if (this.disabled || !this.visible) return false;
        const action = this.capabilities.find((item) => item.id === actionId);
        return !!action && action.enabled !== false && action.visible !== false;
    }

    /** Return a new presentation model with explicit per-object overrides. */
    withOverrides(overrides: Partial<CardData>): Card {
        return new Card({
            id: this.id, name: this.name, type: this.type, level: this.level,
            environment: this.environment, parentId: this.parentId,
            size: this.size, extension: this.extension, color: this.color,
            icon: this.icon, footer: this.footer, childrenCount: this.childrenCount,
            keyword: this.keyword, capabilities: this.capabilities,
            navigation: this.navigation, visible: this.visible, disabled: this.disabled,
            classNames: this.classNames, ...overrides,
            properties: { ...this.properties, ...(overrides.properties ?? {}) },
        });
    }

    /** Temporary compatibility getters for existing WorkspaceItemCard usage. */
    get isFile(): boolean { return this.type === "file"; }
    get isFolder(): boolean { return ["folder", "project", "system"].includes(this.type); }
    get isSystem(): boolean { return this.type === "system"; }
    get isProject(): boolean { return this.type === "project"; }
    get isRoot(): boolean { return this.parentId === null; }
}

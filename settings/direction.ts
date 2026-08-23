import type { LayoutDirection } from "../locales";

export function getDirectionalLayout(direction: LayoutDirection) {
    const isRtl = direction === "rtl";
    return {
        isRtl,
        textAlign: isRtl ? "right" as const : "left" as const,
    };
}

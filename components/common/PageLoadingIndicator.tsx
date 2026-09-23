/** Centered loading indicator shared by the four content pages. */
import { useSettings } from "../../settings/SettingsContext";

export default function PageLoadingIndicator({ label }: { label?: string }) {
    const { direction, theme } = useSettings();
    const colors = theme.colors;
    const text = label ?? (direction === "rtl" ? "در حال بارگذاری..." : "Loading...");
    return (
        <div role="status" aria-live="polite" aria-label={text} style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <style>{`@keyframes edms-page-loading-spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 22, borderRadius: 16, background: colors.surface, border: `1px solid ${colors.border}`, boxShadow: "0 8px 30px rgba(0,0,0,0.09)", color: colors.text }}>
                <div aria-hidden="true" style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${colors.border}`, borderTopColor: colors.primary, animation: "edms-page-loading-spin 750ms linear infinite" }} />
                <span style={{ fontSize: 13, fontWeight: 600, direction }}>{text}</span>
            </div>
        </div>
    );
}

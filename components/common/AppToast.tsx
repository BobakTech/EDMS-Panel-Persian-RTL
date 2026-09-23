import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Feather } from "../../web/icons";
import { useSettings } from "../../settings/SettingsContext";

export type AppToastType = "success" | "error" | "info";

export interface AppToastMessage {
    id: number;
    type: AppToastType;
    message: string;
    duration?: number;
    actionLabel?: string;
    onAction?: () => void;
}

interface AppToastProps {
    toasts: AppToastMessage[];
    onDismiss: (id: number) => void;
}

interface ToastEntry {
    toast: AppToastMessage;
    exiting: boolean;
}

const MAX_VISIBLE = 4;
const EXIT_DURATION = 220;
const DEFAULT_DURATION = 5000;

const toastColors: Record<AppToastType, string> = {
    success: "#16A34A",
    error: "#DC2626",
    info: "#2563EB",
};

const toastIcons: Record<AppToastType, "check-circle" | "alert-circle" | "info"> = {
    success: "check-circle",
    error: "alert-circle",
    info: "info",
};

function ToastCard({
    toast,
    exiting,
    onDismiss,
}: {
    toast: AppToastMessage;
    exiting: boolean;
    onDismiss: (id: number) => void;
}) {
    const { direction, theme } = useSettings();
    const accentColor = toastColors[toast.type];
    const isRtl = direction === "rtl";
    const duration = toast.duration ?? DEFAULT_DURATION;

    return (
        <div
            role="alert"
            dir={direction}
            className={`edms-toast-card${exiting ? " edms-toast-exit" : ""}`}
            style={{
                position: "relative",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                width: "max-content",
                maxWidth: "100%",
                minHeight: 0,
                padding: "10px 12px 13px",
                overflow: "hidden",
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.border}`,
                borderInlineStart: `4px solid ${accentColor}`,
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.22)",
                animation: exiting
                    ? undefined
                    : "edms-toast-enter 220ms ease-out both",
            }}
        >
            {/* Main notification status icon. Uses native SVG for reliable rendering. */}
            <span style={{ display: "inline-flex", flexShrink: 0 }} aria-hidden="true">
                {toast.type === "success" ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m8 12 2.5 2.5L16 9" />
                    </svg>
                ) : (
                    <Feather name={toastIcons[toast.type]} size={18} color={accentColor} />
                )}
            </span>

            <span
                style={{
                    flex: "0 1 auto",
                    minWidth: 0,
                    fontSize: 13,
                    lineHeight: "20px",
                    textAlign: isRtl ? "right" : "left",
                    overflowWrap: "anywhere",
                }}
            >
                {toast.message}
            </span>

            {toast.actionLabel && toast.onAction && (
                <button
                    type="button"
                    onClick={() => {
                        toast.onAction?.();
                        onDismiss(toast.id);
                    }}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        gap: 6,
                        minHeight: 30,
                        padding: "5px 11px",
                        border: `1px solid ${accentColor}55`,
                        borderRadius: 7,
                        backgroundColor: `${accentColor}22`,
                        color: accentColor,
                        fontWeight: 700,
                        fontSize: 12,
                        lineHeight: "18px",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                    }}
                >
                    <Feather name="rotate-ccw" size={14} color={accentColor} />
                    <span>{toast.actionLabel}</span>
                </button>
            )}

            <button
                type="button"
                aria-label={isRtl ? "بستن اعلان" : "Dismiss notification"}
                onClick={() => onDismiss(toast.id)}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    width: 24,
                    height: 24,
                    padding: 0,
                    border: 0,
                    borderRadius: 6,
                    background: "transparent",
                    color: theme.colors.text,
                    cursor: "pointer",
                }}
            >
                <Feather name="x" size={16} color={theme.colors.text} />
            </button>

            {duration > 0 && (
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        backgroundColor: `${accentColor}30`,
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            width: "100%",
                            backgroundColor: accentColor,
                            transformOrigin: isRtl ? "right" : "left",
                            animation: `edms-toast-progress ${duration}ms linear forwards`,
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default function AppToast({ toasts, onDismiss }: AppToastProps) {
    const [entries, setEntries] = useState<ToastEntry[]>([]);
    const exitTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
    const dismissTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

    useEffect(() => {
        const incomingIds = new Set(toasts.map((toast) => toast.id));

        setEntries((current) => {
            const existingIds = new Set(current.map((entry) => entry.toast.id));

            const updated = current.map((entry) => ({
                ...entry,
                exiting: entry.exiting || !incomingIds.has(entry.toast.id),
            }));

            const incoming = toasts
                .filter((toast) => !existingIds.has(toast.id))
                .map((toast) => ({ toast, exiting: false }));

            const combined = [...updated, ...incoming];

            const active = combined.filter((entry) => !entry.exiting);

            if (active.length > MAX_VISIBLE) {
                const excessIds = new Set(
                    active.slice(0, active.length - MAX_VISIBLE).map((entry) => entry.toast.id)
                );

                return combined.map((entry) => ({
                    ...entry,
                    exiting: entry.exiting || excessIds.has(entry.toast.id),
                }));
            }

            return combined;
        });
    }, [toasts]);

    useEffect(() => {
        entries.forEach(({ toast, exiting }) => {
            if (exiting) {
                const dismissTimer = dismissTimers.current.get(toast.id);
                if (dismissTimer) {
                    clearTimeout(dismissTimer);
                    dismissTimers.current.delete(toast.id);
                }

                if (!exitTimers.current.has(toast.id)) {
                    const timer = setTimeout(() => {
                        exitTimers.current.delete(toast.id);
                        setEntries((current) => current.filter((entry) => entry.toast.id !== toast.id));
                        onDismiss(toast.id);
                    }, EXIT_DURATION);

                    exitTimers.current.set(toast.id, timer);
                }

                return;
            }

            if (!dismissTimers.current.has(toast.id) && (toast.duration ?? DEFAULT_DURATION) > 0) {
                const timer = setTimeout(() => {
                    dismissTimers.current.delete(toast.id);
                    onDismiss(toast.id);
                }, toast.duration ?? DEFAULT_DURATION);

                dismissTimers.current.set(toast.id, timer);
            }
        });
    }, [entries, onDismiss]);

    useEffect(() => {
        const exits = exitTimers.current;
        const dismissals = dismissTimers.current;

        return () => {
            exits.forEach(clearTimeout);
            dismissals.forEach(clearTimeout);
            exits.clear();
            dismissals.clear();
        };
    }, []);

    if (entries.length === 0) return null;

    return createPortal(
        <>
            <style>{`
                @keyframes edms-toast-enter {
                    from { opacity: 0; transform: translateY(12px) scale(.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                @keyframes edms-toast-progress {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }

                .edms-toast-exit {
                    animation: edms-toast-leave 220ms ease-in both;
                    pointer-events: none;
                }

                @keyframes edms-toast-leave {
                    from { opacity: 1; transform: translateY(0) scale(1); }
                    to { opacity: 0; transform: translateY(-8px) scale(.97); }
                }

                @media (prefers-reduced-motion: reduce) {
                    .edms-toast-card,
                    .edms-toast-exit {
                        animation-duration: 1ms !important;
                    }
                }
            `}</style>

            <div
                aria-label="Notifications"
                style={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    zIndex: 2000,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8,
                    width: "max-content",
                    maxWidth: "calc(100vw - 40px)",
                    pointerEvents: "none",
                }}
            >
                {entries.map(({ toast, exiting }) => (
                    <div
                        key={toast.id}
                        style={{
                            maxWidth: "100%",
                            pointerEvents: exiting ? "none" : "auto",
                        }}
                    >
                        <ToastCard
                            toast={toast}
                            exiting={exiting}
                            onDismiss={onDismiss}
                        />
                    </div>
                ))}
            </div>
        </>,
        document.body
    );
}
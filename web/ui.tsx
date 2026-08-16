import React, { forwardRef, useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";

export type ViewStyle = Record<string, any>;
export type TextStyle = ViewStyle;
export type ImageStyle = ViewStyle;

type StyleValue = ViewStyle | false | null | undefined | StyleValue[];
type PressableState = { pressed: boolean; hovered: boolean; focused: boolean };
type PointerLikeEvent = React.PointerEvent<HTMLElement> & { nativeEvent: { pageX: number; pageY: number } };

function flattenStyle(style: StyleValue): CSSProperties {
    if (!style) return {};
    if (Array.isArray(style)) return Object.assign({}, ...style.map(flattenStyle));
    const next = { ...style } as Record<string, unknown>;
    const expandAxis = (property: string, first: string, second: string) => {
        if (next[property] === undefined) return;
        next[first] = next[property];
        next[second] = next[property];
        delete next[property];
    };
    expandAxis("paddingHorizontal", "paddingLeft", "paddingRight");
    expandAxis("paddingVertical", "paddingTop", "paddingBottom");
    expandAxis("marginHorizontal", "marginLeft", "marginRight");
    expandAxis("marginVertical", "marginTop", "marginBottom");
    delete next.shadowColor;
    delete next.shadowOffset;
    delete next.shadowOpacity;
    delete next.shadowRadius;
    delete next.elevation;
    return next as CSSProperties;
}

function ariaProps(props: Record<string, any>) {
    const { accessibilityLabel, accessibilityRole, accessibilityState } = props;
    return {
        "aria-label": accessibilityLabel,
        "aria-current": accessibilityState?.selected ? true : undefined,
        "aria-disabled": accessibilityState?.disabled,
        role: accessibilityRole,
    };
}

export const StyleSheet = {
    create<T extends Record<string, any>>(styles: T): T { return styles; },
    flatten: flattenStyle,
    absoluteFill: { position: "absolute", inset: 0 } as ViewStyle,
};

interface PrimitiveProps {
    [key: string]: any;
    children?: ReactNode;
    style?: StyleValue | ((state: PressableState) => StyleValue);
    onPress?: () => void;
    onChangeText?: (value: string) => void;
    onHoverIn?: (event: PointerLikeEvent) => void;
    onHoverOut?: (event: PointerLikeEvent) => void;
    onPointerMove?: (event: PointerLikeEvent) => void;
}

interface PressableProps {
    children?: ReactNode;
    title?: string;
    style?: StyleValue | ((state: PressableState) => StyleValue);
    onPress?: () => void;
    onHoverIn?: (event: PointerLikeEvent) => void;
    onHoverOut?: (event: PointerLikeEvent) => void;
    onPointerMove?: (event: PointerLikeEvent) => void;
    disabled?: boolean;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    accessibilityState?: Record<string, boolean>;
    hitSlop?: number;
}

interface TextInputProps {
    style?: StyleValue;
    value?: string;
    onChangeText?: (value: string) => void;
    placeholder?: string;
    placeholderTextColor?: string;
    autoFocus?: boolean;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    accessibilityLabel?: string;
    accessibilityRole?: string;
    accessibilityState?: Record<string, boolean>;
}

export const View = forwardRef<HTMLDivElement, PrimitiveProps>(function View(
    { children, style, accessibilityLabel, accessibilityRole, accessibilityState, pointerEvents, ...props },
    ref,
) {
    const webPointerEvents = pointerEvents === "none" ? "none" : pointerEvents ? "auto" : undefined;
    return <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "stretch", position: "relative", ...flattenStyle(style as StyleValue), pointerEvents: webPointerEvents }} {...ariaProps({ accessibilityLabel, accessibilityRole, accessibilityState })} {...props}>{children}</div>;
});

export const Text = forwardRef<HTMLSpanElement, PrimitiveProps>(function Text(
    { children, style, numberOfLines, accessibilityLabel, accessibilityRole, accessibilityState, ...props },
    ref,
) {
    const clamp = numberOfLines ? {
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: numberOfLines,
        overflow: "hidden",
    } as CSSProperties : {};
    return <span ref={ref} style={{ ...flattenStyle(style as StyleValue), ...clamp }} {...ariaProps({ accessibilityLabel, accessibilityRole, accessibilityState })} {...props}>{children}</span>;
});

export const Pressable = forwardRef<HTMLButtonElement, PressableProps>(function Pressable(
    { children, style, onPress, onHoverIn, onHoverOut, onPointerMove, disabled, accessibilityLabel, accessibilityRole, accessibilityState, hitSlop: _hitSlop, ...props },
    ref,
) {
    const [pressed, setPressed] = useState(false);
    const resolvedStyle = typeof style === "function" ? style({ pressed, hovered: false, focused: false }) : style;
    const wrapEvent = (event: React.PointerEvent<HTMLButtonElement>) => ({
        ...event,
        nativeEvent: { ...event.nativeEvent, pageX: event.pageX, pageY: event.pageY },
    });
    return (
        <button
            ref={ref}
            type="button"
            disabled={disabled}
            onClick={onPress}
            onPointerDown={() => setPressed(true)}
            onPointerUp={() => setPressed(false)}
            onPointerCancel={() => setPressed(false)}
            onPointerEnter={(event) => onHoverIn?.(wrapEvent(event))}
            onPointerLeave={(event) => { setPressed(false); onHoverOut?.(wrapEvent(event)); }}
            onPointerMove={(event) => onPointerMove?.(wrapEvent(event))}
            style={{ display: "flex", flexDirection: "column", alignItems: "stretch", position: "relative", border: 0, padding: 0, margin: 0, backgroundColor: "transparent", cursor: disabled ? "default" : "pointer", ...flattenStyle(resolvedStyle) }}
            {...ariaProps({ accessibilityLabel, accessibilityRole, accessibilityState })}
            {...props}
        >{children}</button>
    );
});

export interface TextInput extends HTMLInputElement {}
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
    { style, value, onChangeText, placeholderTextColor, accessibilityLabel, accessibilityRole, accessibilityState, ...props },
    ref,
) {
    return <input ref={ref} value={value ?? ""} onChange={(event) => onChangeText?.(event.target.value)} style={{ border: 0, outline: 0, ...flattenStyle(style), ...(placeholderTextColor ? { "--placeholder-color": placeholderTextColor } as CSSProperties : {}) }} {...ariaProps({ accessibilityLabel, accessibilityRole, accessibilityState })} {...props} />;
});

export const ScrollView = forwardRef<HTMLDivElement, PrimitiveProps>(function ScrollView(
    { children, style, contentContainerStyle, horizontal, showsVerticalScrollIndicator: _vertical, showsHorizontalScrollIndicator: _horizontal, keyboardShouldPersistTaps: _keyboard, ...props },
    ref,
) {
    return <div ref={ref} style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, overflowX: horizontal ? "auto" : undefined, overflowY: horizontal ? "hidden" : "auto", ...flattenStyle(style) }} {...props}><div style={{ display: "flex", flexDirection: "column", ...flattenStyle(contentContainerStyle) }}>{children}</div></div>;
});

export const Image = forwardRef<HTMLImageElement, PrimitiveProps>(function Image(
    { style, source, resizeMode, accessibilityLabel, ...props },
    ref,
) {
    const uri = typeof source === "string" ? source : source?.uri;
    return <img ref={ref} src={uri} alt={accessibilityLabel ?? ""} style={{ objectFit: resizeMode ?? "cover", ...flattenStyle(style) }} {...props} />;
});

export function Modal({ visible, children, transparent: _transparent, animationType: _animationType }: PrimitiveProps) {
    if (!visible) return null;
    return createPortal(<>{children}</>, document.body);
}

export function ActivityIndicator({ color = "currentColor", size = 20, style }: PrimitiveProps) {
    const diameter = size === "small" ? 16 : size === "large" ? 32 : size;
    return <span aria-label="در حال بارگذاری" style={{ width: diameter, height: diameter, display: "inline-block", border: `2px solid ${color}33`, borderTopColor: color, borderRadius: "50%", animation: "edms-spin .8s linear infinite", ...flattenStyle(style as StyleValue) }} />;
}

export function useWindowDimensions() {
    const getSize = () => ({ width: window.innerWidth, height: window.innerHeight, scale: window.devicePixelRatio, fontScale: 1 });
    const [size, setSize] = useState(getSize);
    useEffect(() => {
        const update = () => setSize(getSize());
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);
    return useMemo(() => size, [size]);
}

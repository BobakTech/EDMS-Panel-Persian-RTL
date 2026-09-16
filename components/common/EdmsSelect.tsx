import type { ChangeEvent, CSSProperties, ReactNode } from "react";
import { useSettings } from "../../settings/SettingsContext";
import { radius, typography } from "../../theme";

interface EdmsSelectProps {
    value: string | number;
    children: ReactNode;
    onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
    ariaLabel: string;
    disabled?: boolean;
    width?: string | number;
    minWidth?: string | number;
    height?: number;
    style?: CSSProperties;
}

export default function EdmsSelect({
    value,
    children,
    onChange,
    ariaLabel,
    disabled = false,
    width = "100%",
    minWidth,
    height = 38,
    style,
}: EdmsSelectProps) {
    const { direction, theme } = useSettings();
    const colors = theme.colors;

    return (
        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            aria-label={ariaLabel}
            dir={direction}
            style={{
                width,
                minWidth,
                height,
                paddingInlineStart: 12,
                paddingInlineEnd: 34,
                border: `1px solid ${colors.border}`,
                borderRadius: radius.md,
                backgroundColor: colors.surface,
                color: colors.text,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                textAlign: direction === "rtl" ? "right" : "left",
                outline: "none",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
                ...style,
            }}
        >
            {children}
        </select>
    );
}
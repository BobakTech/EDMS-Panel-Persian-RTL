import {
    useEffect,
    useRef,
    useState,
} from "react";
import type {
    CSSProperties,
    KeyboardEvent,
} from "react";
import { Feather } from "../../web/icons";
import { useSettings } from "../../settings/SettingsContext";
import {
    radius,
    semanticColors,
    shadows,
    spacing,
    typography,
} from "../../theme";

export interface EdmsSelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

interface EdmsSelectProps {
    value: string | number;
    options: EdmsSelectOption[];
    onChange: (value: string) => void;
    ariaLabel: string;
    placeholder?: string;
    disabled?: boolean;
    width?: string | number;
    minWidth?: string | number;
    height?: number;
    maxMenuHeight?: number;
    style?: CSSProperties;
}

export default function EdmsSelect({
    value,
    options,
    onChange,
    ariaLabel,
    placeholder,
    disabled = false,
    width = "100%",
    minWidth,
    height = 38,
    maxMenuHeight = 240,
    style,
}: EdmsSelectProps) {
    const { direction, theme } = useSettings();
    const colors = theme.colors;

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const selectedIndex = options.findIndex(
        (option) => String(option.value) === String(value)
    );

    const selectedOption =
        selectedIndex >= 0 ? options[selectedIndex] : null;

    function findEnabledIndex(
        startIndex: number,
        step: 1 | -1
    ) {
        if (!options.length) return -1;

        let index = startIndex;

        for (let count = 0; count < options.length; count += 1) {
            if (index < 0) index = options.length - 1;
            if (index >= options.length) index = 0;

            if (!options[index].disabled) {
                return index;
            }

            index += step;
        }

        return -1;
    }

    function openMenu() {
        if (disabled) return;

        const initialIndex =
            selectedIndex >= 0 && !options[selectedIndex]?.disabled
                ? selectedIndex
                : findEnabledIndex(0, 1);

        setActiveIndex(initialIndex);
        setIsOpen(true);
    }

    function closeMenu() {
        setIsOpen(false);
        setActiveIndex(-1);
    }

    function toggleMenu() {
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    function selectOption(option: EdmsSelectOption) {
        if (option.disabled) return;

        onChange(String(option.value));
        closeMenu();
    }

    function moveActive(step: 1 | -1) {
        const startIndex =
            activeIndex >= 0
                ? activeIndex + step
                : step === 1
                    ? 0
                    : options.length - 1;

        const nextIndex = findEnabledIndex(startIndex, step);

        if (nextIndex >= 0) {
            setActiveIndex(nextIndex);
        }
    }

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (disabled) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();

            if (!isOpen) {
                openMenu();
            } else {
                moveActive(1);
            }

            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            if (!isOpen) {
                openMenu();
            } else {
                moveActive(-1);
            }

            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            if (!isOpen) {
                openMenu();
                return;
            }

            if (activeIndex >= 0) {
                selectOption(options[activeIndex]);
            }

            return;
        }

        if (event.key === "Escape" && isOpen) {
            event.preventDefault();
            closeMenu();
        }
    }

    useEffect(() => {
        if (!isOpen) return;

        function handlePointerDown(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                closeMenu();
            }
        }

        function handleEscape(event: globalThis.KeyboardEvent) {
            if (event.key === "Escape") {
                closeMenu();
            }
        }

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    return (
        <div
            ref={wrapperRef}
            dir={direction}
            style={{
                position: "relative",
                width,
                minWidth,
                ...style,
            }}
        >
            <button
                type="button"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                disabled={disabled}
                onClick={toggleMenu}
                onKeyDown={handleKeyDown}
                style={{
                    width: "100%",
                    height,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: spacing.sm,
                    paddingInlineStart: spacing.md,
                    paddingInlineEnd: spacing.sm,
                    border: `1px solid ${isOpen ? colors.primary : colors.border
                        }`,
                    borderRadius: radius.md,
                    backgroundColor: colors.surface,
                    color: selectedOption
                        ? colors.text
                        : semanticColors.muted,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    fontFamily: "inherit",
                    textAlign: direction === "rtl" ? "right" : "left",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.6 : 1,
                    outline: "none",
                    boxShadow: isOpen
                        ? `0 0 0 3px ${semanticColors.selectedSurface}`
                        : "none",
                    transition:
                        "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
                }}
            >
                <span
                    style={{
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {selectedOption?.label ?? placeholder ?? ariaLabel}
                </span>

                <span
                    aria-hidden="true"
                    style={{
                        flexShrink: 0,
                        width: 22,
                        height: 22,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transform: isOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition: "transform 180ms ease",
                    }}
                >
                    <Feather
                        name="chevron-down"
                        size={17}
                        color={colors.text}
                    />
                </span>
            </button>

            <div
                role="listbox"
                aria-label={ariaLabel}
                style={{
                    position: "absolute",
                    top: `calc(100% + ${spacing.xs}px)`,
                    left: 0,
                    right: 0,
                    zIndex: 200,
                    maxHeight: isOpen ? maxMenuHeight : 0,
                    overflowX: "hidden",
                    overflowY: isOpen ? "auto" : "hidden",
                    border: isOpen
                        ? `1px solid ${colors.border}`
                        : "1px solid transparent",
                    borderRadius: radius.md,
                    backgroundColor: colors.surface,
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? "visible" : "hidden",
                    transform: isOpen
                        ? "translateY(0) scale(1)"
                        : "translateY(-6px) scale(0.985)",
                    transformOrigin: "top center",
                    pointerEvents: isOpen ? "auto" : "none",
                    transition:
                        "opacity 160ms ease, transform 180ms ease, max-height 200ms ease, visibility 160ms ease",
                    ...shadows.lg,
                }}
            >
                {options.map((option, index) => {
                    const isSelected =
                        String(option.value) === String(value);
                    const isActive = index === activeIndex;

                    return (
                        <button
                            key={String(option.value)}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            disabled={option.disabled}
                            onMouseEnter={() => {
                                if (!option.disabled) {
                                    setActiveIndex(index);
                                }
                            }}
                            onMouseLeave={() => {
                                if (!option.disabled) {
                                    setActiveIndex(-1);
                                }
                            }}
                            onClick={() => selectOption(option)}
                            style={{
                                width: "100%",
                                minHeight: 38,
                                display: "flex",
                                alignItems: "center",
                                gap: spacing.sm,
                                paddingInline: spacing.md,
                                paddingBlock: 7,
                                border: 0,
                                backgroundColor:
                                    isSelected || isActive
                                        ? semanticColors.selectedSurface
                                        : colors.surface,
                                color: option.disabled
                                    ? semanticColors.muted
                                    : colors.text,
                                fontSize: typography.fontSize.sm,
                                fontWeight: isSelected
                                    ? typography.fontWeight.semibold
                                    : typography.fontWeight.medium,
                                fontFamily: "inherit",
                                textAlign:
                                    direction === "rtl"
                                        ? "right"
                                        : "left",
                                cursor: option.disabled
                                    ? "not-allowed"
                                    : "pointer",
                                opacity: option.disabled ? 0.62 : 1,
                                transition:
                                    "background-color 120ms ease, color 120ms ease, opacity 120ms ease",
                            }}
                        >
                            <span
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",

                                    // Explicit rather than inherited.
                                    color: option.disabled
                                        ? semanticColors.muted
                                        : colors.text,
                                }}
                            >
                                {option.label}
                            </span>

                            {isSelected && (
                                <Feather
                                    name="check"
                                    size={15}
                                    color={colors.primary}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
/**
 * ============================================================================
 * Settings Context
 * ----------------------------------------------------------------------------
 * Manages application settings such as theme and language.
 * ============================================================================
 */

import {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from "react";

import { DEFAULT_LANGUAGE, DEFAULT_THEME } from "../constants/app";
import {
    languageDirections,
    translations,
    Language,
    type LayoutDirection,
    type TranslationKey,
} from "../locales";
import { darkTheme, lightTheme } from "../theme";

export type ThemeMode = "light" | "dark";

interface SettingsContextValue {
    themeMode: ThemeMode;
    language: Language;
    direction: LayoutDirection;

    theme: typeof lightTheme;

    setThemeMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;

    setLanguage: (language: Language) => void;

    t: (key: TranslationKey) => string;
}

/**
 * ============================================================================
 * Context
 * ============================================================================
 */

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * ============================================================================
 * Provider
 * ============================================================================
 */

interface SettingsProviderProps {
    children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
    const [themeMode, setThemeMode] = useState<ThemeMode>(DEFAULT_THEME);

    const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
    const direction = languageDirections[language];

    const theme =
        themeMode === "light"
            ? lightTheme
            : darkTheme;

    const t = (key: TranslationKey) =>
        translations[language][key];

    const value = useMemo(
        () => ({
            themeMode,
            language,
            direction,

            theme,

            setThemeMode,

            toggleTheme: () =>
                setThemeMode((current) =>
                    current === "light" ? "dark" : "light"
                ),

            setLanguage,

            t,
        }),
        [themeMode, language, direction, theme]
    );

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

/**
 * ============================================================================
 * Hook
 * ============================================================================
 */

export function useSettings() {
    const context = useContext(SettingsContext);

    if (!context) {
        throw new Error(
            "useSettings must be used within SettingsProvider."
        );
    }

    return context;
}

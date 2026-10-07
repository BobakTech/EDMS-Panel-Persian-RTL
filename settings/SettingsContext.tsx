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

interface SavedDefaultSettings {
    themeMode: ThemeMode;
    language: Language;
}

interface SettingsContextValue {
    themeMode: ThemeMode;
    language: Language;
    direction: LayoutDirection;

    theme: typeof lightTheme;

    setThemeMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;

    setLanguage: (language: Language) => void;

    hasDefaultChanges: boolean;
    resetSettings: () => boolean;
    saveSettingsAsDefault: () => boolean;

    t: (key: TranslationKey) => string;
}

/**
 * ============================================================================
 * Saved Defaults
 * ============================================================================
 */

const SETTINGS_DEFAULTS_STORAGE_KEY = "edms.settings.defaults";

function getFactoryDefaults(): SavedDefaultSettings {
    return {
        themeMode: DEFAULT_THEME,
        language: DEFAULT_LANGUAGE,
    };
}

function getSavedDefaults(): SavedDefaultSettings {
    if (typeof window === "undefined") return getFactoryDefaults();

    try {
        const storedValue = window.localStorage.getItem(SETTINGS_DEFAULTS_STORAGE_KEY);

        if (!storedValue) return getFactoryDefaults();

        const storedSettings = JSON.parse(storedValue) as Partial<SavedDefaultSettings>;

        const themeMode: ThemeMode =
            storedSettings.themeMode === "light" || storedSettings.themeMode === "dark"
                ? storedSettings.themeMode
                : DEFAULT_THEME;

        const language: Language =
            storedSettings.language === "fa" || storedSettings.language === "en"
                ? storedSettings.language
                : DEFAULT_LANGUAGE;

        return {
            themeMode,
            language,
        };
    } catch {
        return getFactoryDefaults();
    }
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
    const [initialDefaults] = useState<SavedDefaultSettings>(() => getSavedDefaults());

    const [themeMode, setThemeMode] = useState<ThemeMode>(initialDefaults.themeMode);
    const [language, setLanguage] = useState<Language>(initialDefaults.language);
    const [savedDefaults, setSavedDefaults] = useState<SavedDefaultSettings>(initialDefaults);

    const direction = languageDirections[language];

    const theme =
        themeMode === "light"
            ? lightTheme
            : darkTheme;

    const t = (key: TranslationKey) =>
        translations[language][key];

    const hasDefaultChanges =
        themeMode !== savedDefaults.themeMode ||
        language !== savedDefaults.language;

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

            hasDefaultChanges,

            resetSettings: () => {
                const factoryDefaults = getFactoryDefaults();

                if (typeof window === "undefined") return false;

                try {
                    window.localStorage.setItem(
                        SETTINGS_DEFAULTS_STORAGE_KEY,
                        JSON.stringify(factoryDefaults)
                    );

                    setThemeMode(factoryDefaults.themeMode);
                    setLanguage(factoryDefaults.language);
                    setSavedDefaults(factoryDefaults);

                    return true;
                } catch {
                    return false;
                }
            },

            saveSettingsAsDefault: () => {
                if (typeof window === "undefined") return false;

                const defaults: SavedDefaultSettings = {
                    themeMode,
                    language,
                };

                try {
                    window.localStorage.setItem(
                        SETTINGS_DEFAULTS_STORAGE_KEY,
                        JSON.stringify(defaults)
                    );

                    setSavedDefaults(defaults);
                    return true;
                } catch {
                    return false;
                }
            },

            t,
        }),
        [
            themeMode,
            language,
            direction,
            theme,
            savedDefaults,
            hasDefaultChanges,
        ]
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
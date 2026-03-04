/**
 * Application constants.
 * Single source of truth for magic values across the app.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const LRCLIB_BASE_URL = 'https://lrclib.net';

/** LocalStorage keys — centralized to prevent collisions */
export const STORAGE_KEYS = {
    PLAYER_STATE: 'm14u-player-state',
    FAVORITES: 'm14u-favorites',
    LISTENING_HISTORY: 'm14u-history',
    RECENT_SEARCHES: 'm14u-recent-searches',
    USER_LOCALE: 'm14u-user-locale',
    ONBOARDING_DONE: 'm14u-onboarding-done',
    VOLUME: 'm14u-volume',
    THEME: 'm14u-theme',
} as const;

/** Maximum items stored in various lists */
export const LIMITS = {
    LISTENING_HISTORY: 100,
    RECENT_SEARCHES: 20,
    FAVORITES: 500,
    QUEUE: 200,
} as const;

/** Debounce delays in ms */
export const DEBOUNCE = {
    SEARCH: 350,
    SEEK: 100,
    VOLUME: 50,
    RESIZE: 150,
} as const;

/** Breakpoints matching Tailwind defaults */
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
} as const;

/** Keyboard shortcut mappings */
export const SHORTCUTS: Record<string, string> = {
    'Space': 'Play / Pause',
    'ArrowLeft': 'Seek backward 5s',
    'ArrowRight': 'Seek forward 5s',
    'ArrowUp': 'Volume up',
    'ArrowDown': 'Volume down',
    'KeyN': 'Next track',
    'KeyP': 'Previous track',
    'KeyM': 'Mute / Unmute',
    'KeyL': 'Toggle lyrics',
    'KeyQ': 'Toggle queue',
} as const;

/** Supported locale options for the language picker */
export const LOCALE_OPTIONS = [
    { label: 'English', value: 'english' },
    { label: 'Tamil', value: 'tamil' },
    { label: 'Hindi', value: 'hindi' },
    { label: 'Telugu', value: 'telugu' },
    { label: 'Kannada', value: 'kannada' },
    { label: 'Malayalam', value: 'malayalam' },
    { label: 'Bengali', value: 'bengali' },
    { label: 'Marathi', value: 'marathi' },
    { label: 'Punjabi', value: 'punjabi' },
    { label: 'Korean', value: 'korean' },
    { label: 'Japanese', value: 'japanese' },
    { label: 'Spanish', value: 'spanish' },
    { label: 'French', value: 'french' },
    { label: 'German', value: 'german' },
    { label: 'Arabic', value: 'arabic' },
    { label: 'Portuguese', value: 'portuguese' },
] as const;

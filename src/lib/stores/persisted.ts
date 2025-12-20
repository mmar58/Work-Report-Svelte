import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Creates a Svelte writable store that persists to localStorage
 */
export function persisted<T>(key: string, initialValue: T): Writable<T> {
    // Get initial value from localStorage if in browser
    const stored = browser ? localStorage.getItem(key) : null;
    const data = stored ? JSON.parse(stored) : initialValue;

    // Create writable store
    const store = writable<T>(data);

    // Subscribe to store changes and persist to localStorage
    if (browser) {
        store.subscribe((value) => {
            localStorage.setItem(key, JSON.stringify(value));
        });
    }

    return store;
}

/**
 * Creates a persisted store with TTL (time to live)
 */
export function persistedWithTTL<T>(
    key: string,
    initialValue: T,
    ttlMs: number
): Writable<T> {
    const stored = browser ? localStorage.getItem(key) : null;
    const timestampKey = `${key}_timestamp`;
    const timestamp = browser ? localStorage.getItem(timestampKey) : null;

    let data = initialValue;

    if (stored && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age < ttlMs) {
            data = JSON.parse(stored);
        } else {
            // Clear expired data
            if (browser) {
                localStorage.removeItem(key);
                localStorage.removeItem(timestampKey);
            }
        }
    }

    const store = writable<T>(data);

    if (browser) {
        store.subscribe((value) => {
            localStorage.setItem(key, JSON.stringify(value));
            localStorage.setItem(timestampKey, Date.now().toString());
        });
    }

    return store;
}

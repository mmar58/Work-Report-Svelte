import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

interface PersistedData<T> {
	value: T;
	timestamp: number;
}

/**
 * Creates a Svelte writable store that persists to localStorage
 */
export function persisted<T>(key: string, initialValue: T): Writable<T> {
	// Get initial value from localStorage if in browser
	const stored = browser ? localStorage.getItem(key) : null;
	const data = stored ? (JSON.parse(stored) as T) : initialValue;

	const store = writable<T>(data);

	// Subscribe to store changes and update localStorage
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
	let data = initialValue;

	if (stored) {
		try {
			const parsed = JSON.parse(stored) as PersistedData<T>;
			const now = Date.now();

			// Check if data is still valid
			if (now - parsed.timestamp < ttlMs) {
				data = parsed.value;
			} else {
				// Data expired, remove from localStorage
				if (browser) {
					localStorage.removeItem(key);
				}
			}
		} catch {
			// Invalid data, use initial value
			if (browser) {
				localStorage.removeItem(key);
			}
		}
	}

	const store = writable<T>(data);

	// Subscribe to store changes and update localStorage with timestamp
	if (browser) {
		store.subscribe((value) => {
			const dataWithTimestamp: PersistedData<T> = {
				value,
				timestamp: Date.now()
			};
			localStorage.setItem(key, JSON.stringify(dataWithTimestamp));
		});
	}

	return store;
}

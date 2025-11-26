import { writable, derived } from 'svelte/store';
import { persisted } from './persisted';
import type { UIState, Notification } from '$lib/types';
import { browser } from '$app/environment';

// Theme store with system preference detection
function createThemeStore() {
	const stored = persisted<'light' | 'dark' | 'system'>('theme', 'system');

	return {
		subscribe: stored.subscribe,
		set: (value: 'light' | 'dark' | 'system') => {
			stored.set(value);
			if (browser) {
				applyTheme(value);
			}
		},
		toggle: () => {
			stored.update((current) => {
				const next = current === 'light' ? 'dark' : 'light';
				if (browser) {
					applyTheme(next);
				}
				return next;
			});
		}
	};
}

function applyTheme(theme: 'light' | 'dark' | 'system') {
	if (!browser) return;

	const root = document.documentElement;

	if (theme === 'system') {
		const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
		root.classList.toggle('dark', systemTheme === 'dark');
	} else {
		root.classList.toggle('dark', theme === 'dark');
	}
}

export const theme = createThemeStore();

// Layout direction (responsive)
export const layoutDirection = writable<'horizontal' | 'vertical'>('horizontal');

// Loading/refreshing state
export const isRefreshing = writable<boolean>(false);

// Notifications
export const notifications = writable<Notification[]>([]);

// Helper functions for notifications
export function addNotification(
	type: Notification['type'],
	message: string,
	duration = 3000
) {
	const id = Date.now().toString();
	notifications.update((n) => [...n, { id, type, message, duration }]);

	if (duration > 0) {
		setTimeout(() => {
			removeNotification(id);
		}, duration);
	}
}

export function removeNotification(id: string) {
	notifications.update((n) => n.filter((notification) => notification.id !== id));
}

export function clearNotifications() {
	notifications.set([]);
}

// Combined UI state
export const uiState = derived(
	[theme, layoutDirection, isRefreshing, notifications],
	([$theme, $layoutDirection, $isRefreshing, $notifications]) =>
		({
			theme: $theme,
			layoutDirection: $layoutDirection,
			isRefreshing: $isRefreshing,
			notifications: $notifications
		}) as UIState
);

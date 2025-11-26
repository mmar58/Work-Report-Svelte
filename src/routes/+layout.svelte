<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/ui';
	import { browser } from '$app/environment';
	
	let { children } = $props();

	onMount(() => {
		// Apply initial theme
		if (browser) {
			const root = document.documentElement;
			const currentTheme = $theme;

			if (currentTheme === 'system') {
				const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light';
				root.classList.toggle('dark', systemTheme === 'dark');
			} else {
				root.classList.toggle('dark', currentTheme === 'dark');
			}

			// Listen for system theme changes
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			const handleChange = (e: MediaQueryListEvent) => {
				if ($theme === 'system') {
					root.classList.toggle('dark', e.matches);
				}
			};
			mediaQuery.addEventListener('change', handleChange);

			return () => {
				mediaQuery.removeEventListener('change', handleChange);
			};
		}
	});
</script>

<div class="min-h-screen bg-background text-foreground">
	{@render children()}
</div>

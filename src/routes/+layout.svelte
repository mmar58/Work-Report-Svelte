<script lang="ts">
	import "../app.css";
	import { Toaster } from "$lib/components/ui/sonner";
	import { theme } from "$lib/stores/settings";
	import { browser } from "$app/environment";

	let { children } = $props();

	$effect(() => {
		if (browser) {
			const isDark =
				$theme === "dark" ||
				($theme === "system" &&
					window.matchMedia("(prefers-color-scheme: dark)").matches);
			document.documentElement.classList.toggle("dark", isDark);
		}
	});
</script>

<div
	class="min-h-screen bg-background text-foreground transition-colors duration-300 antialiased selection:bg-primary/20 selection:text-primary relative overflow-hidden font-sans"
>
	<!-- Ambient Background Gradients -->
	<div class="fixed inset-0 overflow-hidden pointer-events-none -z-10">
		<div
			class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] opacity-50 dark:opacity-20 animate-pulse"
		></div>
		<div
			class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px] opacity-50 dark:opacity-20 animate-pulse delay-1000"
		></div>
	</div>

	{@render children()}
	<Toaster />
</div>

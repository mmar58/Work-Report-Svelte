<script lang="ts">
	import "./layout.css";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";

	let { children } = $props();
</script>

<div
	class="min-h-screen bg-background text-foreground transition-colors duration-300 antialiased selection:bg-primary/20 selection:text-primary relative overflow-hidden"
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
</div>

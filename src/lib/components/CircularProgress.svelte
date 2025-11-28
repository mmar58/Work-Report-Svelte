<script lang="ts">
	import { onMount } from 'svelte';
	
	let {
		value = 0,
		max = 100,
		size = 200,
		strokeWidth = 16,
		color = 'hsl(var(--primary))',
		backgroundColor = 'hsl(var(--muted))',
		showPercentage = true,
		label = '',
		animated = true
	}: {
		value: number;
		max?: number;
		size?: number;
		strokeWidth?: number;
		color?: string;
		backgroundColor?: string;
		showPercentage?: boolean;
		label?: string;
		animated?: boolean;
	} = $props();
	
	let mounted = $state(false);
	
	onMount(() => {
		if (animated) {
			setTimeout(() => {
				mounted = true;
			}, 100);
		} else {
			mounted = true;
		}
	});
	
	let percentage = $derived(Math.min((value / max) * 100, 100));
	let displayPercentage = $derived(mounted ? percentage : 0);
	let radius = $derived((size - strokeWidth) / 2);
	let circumference = $derived(2 * Math.PI * radius);
	let offset = $derived(circumference - (displayPercentage / 100) * circumference);
	let center = $derived(size / 2);
</script>

<div class="flex flex-col items-center gap-3">
	<div class="relative" style="width: {size}px; height: {size}px;">
		<svg
			width={size}
			height={size}
			viewBox="0 0 {size} {size}"
			class="transform -rotate-90"
		>
			<!-- Background circle -->
			<circle
				cx={center}
				cy={center}
				r={radius}
				stroke={backgroundColor}
				stroke-width={strokeWidth}
				fill="none"
			/>
			
			<!-- Progress circle -->
			<circle
				cx={center}
				cy={center}
				r={radius}
				stroke={color}
				stroke-width={strokeWidth}
				fill="none"
				stroke-dasharray={circumference}
				stroke-dashoffset={offset}
				stroke-linecap="round"
				class="transition-all duration-1000 ease-out"
			/>
		</svg>
		
		<!-- Center text -->
		{#if showPercentage}
			<div class="absolute inset-0 flex flex-col items-center justify-center">
				<div class="text-3xl font-bold">
					{Math.round(displayPercentage)}%
				</div>
				{#if label}
					<div class="text-sm text-muted-foreground mt-1">
						{label}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

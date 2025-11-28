<script lang="ts">
	import { onMount } from 'svelte';
	
	interface DataPoint {
		label: string;
		value: number;
		isToday?: boolean;
	}
	
	let { 
		data = [] as DataPoint[],
		maxValue = 0,
		height = 300,
		color = 'hsl(var(--primary))',
		todayColor = 'hsl(var(--destructive))'
	}: {
		data: DataPoint[];
		maxValue?: number;
		height?: number;
		color?: string;
		todayColor?: string;
	} = $props();
	
	let mounted = $state(false);
	
	onMount(() => {
		setTimeout(() => {
			mounted = true;
		}, 100);
	});
	
	let max = $derived(maxValue || Math.max(...data.map(d => d.value), 1));
	let getBarHeight = $derived.by(() => (value: number) => (value / max) * 100);
</script>

<div class="w-full" style="height: {height}px;">
	<div class="flex items-end justify-between gap-2 h-full">
		{#each data as point, index}
			{@const barHeight = getBarHeight(point.value)}
			{@const barColor = point.isToday ? todayColor : color}
			<div class="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
				<!-- Bar -->
				<div class="relative w-full flex flex-col justify-end" style="height: 90%;">
					<div 
						class="w-full rounded-t-md transition-all duration-700 ease-out hover:opacity-80 cursor-pointer relative"
						style="height: {mounted ? barHeight : 0}%; background-color: {barColor}; transition-delay: {index * 50}ms;"
					>
						<!-- Value tooltip -->
						<div class="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-md">
							{(point.value / 60).toFixed(1)}h
						</div>
					</div>
				</div>
				
				<!-- Label -->
				<div class="text-xs text-muted-foreground font-medium text-center w-full truncate">
					{point.label}
				</div>
			</div>
		{/each}
	</div>
</div>

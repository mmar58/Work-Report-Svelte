<script lang="ts">
	import { TrendingUp, TrendingDown, Minus } from '@lucide/svelte';
	
	let {
		current = 0,
		previous = 0,
		label = '',
		format = (val: number) => val.toString()
	}: {
		current: number;
		previous: number;
		label?: string;
		format?: (val: number) => string;
	} = $props();
	
	let difference = $derived(current - previous);
	let percentageChange = $derived(previous === 0 ? 0 : ((difference / previous) * 100));
	let trend = $derived(difference > 0 ? 'up' : difference < 0 ? 'down' : 'same');
	let trendColor = $derived(trend === 'up' ? 'text-green-600 dark:text-green-400' : 
	                trend === 'down' ? 'text-red-600 dark:text-red-400' : 
	                'text-muted-foreground');
	let bgColor = $derived(trend === 'up' ? 'bg-green-100 dark:bg-green-950' : 
	              trend === 'down' ? 'bg-red-100 dark:bg-red-950' : 
	              'bg-muted');
</script>

<div class="inline-flex items-center gap-2 {bgColor} px-3 py-1.5 rounded-full transition-all duration-300">
	{#if trend === 'up'}
		<TrendingUp class="h-4 w-4 {trendColor}" />
	{:else if trend === 'down'}
		<TrendingDown class="h-4 w-4 {trendColor}" />
	{:else}
		<Minus class="h-4 w-4 {trendColor}" />
	{/if}
	
	<span class="text-sm font-semibold {trendColor}">
		{#if trend !== 'same'}
			{Math.abs(percentageChange).toFixed(1)}%
		{:else}
			No change
		{/if}
	</span>
	
	{#if label}
		<span class="text-xs text-muted-foreground">
			{label}
		</span>
	{/if}
</div>

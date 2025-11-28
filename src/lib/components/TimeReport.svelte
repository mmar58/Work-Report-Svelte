<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { currentWeekData, previousWeekData, todayWorkData, viewMode } from '$lib/stores';
	import { formatDuration } from '$lib/utils/formatters';
	import { calculateDailyTotals, groupEntriesByDate } from '$lib/utils/calculations';
	import { format, parseISO } from 'date-fns';
	import { checkIsToday } from '$lib/utils/dateUtils';
	import BarChart from './BarChart.svelte';
	import TrendIndicator from './TrendIndicator.svelte';
	import { BarChart3, Calendar, Clock } from '@lucide/svelte';

	$: dailyTotals = calculateDailyTotals($currentWeekData.entries);
	$: viewModeLabel = $viewMode === 'week' ? 'Week' : $viewMode === 'month' ? 'Month' : 'Year';
	$: chartData = dailyTotals.map(day => ({
		label: format(parseISO(day.date), 'EEE'),
		value: day.totalMinutes,
		isToday: checkIsToday(day.date)
	}));
</script>


<Card class="p-6 overflow-hidden">
	<div class="space-y-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<BarChart3 class="h-5 w-5 text-primary" />
				<h3 class="text-lg font-semibold">Time Report</h3>
			</div>
			<Badge variant="outline" class="gap-1.5">
				<Calendar class="h-3 w-3" />
				{viewModeLabel} View
			</Badge>
		</div>

		<!-- Summary Cards with Animations -->
		<div class="grid grid-cols-3 gap-4">
			<div class="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 transition-all duration-300 hover:shadow-lg hover:scale-105">
				<div class="flex items-center gap-2 mb-2">
					<Clock class="h-4 w-4 text-primary" />
					<p class="text-xs text-muted-foreground font-medium">Current {viewModeLabel}</p>
				</div>
				<p class="text-2xl font-bold text-primary">{formatDuration($currentWeekData.totalMinutes)}</p>
			</div>
			<div class="p-4 bg-gradient-to-br from-muted to-muted/50 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105">
				<p class="text-xs text-muted-foreground mb-2 font-medium">Previous {viewModeLabel}</p>
				<p class="text-2xl font-bold">{formatDuration($previousWeekData.totalMinutes)}</p>
				<div class="mt-2">
					<TrendIndicator current={$currentWeekData.totalMinutes} previous={$previousWeekData.totalMinutes} />
				</div>
			</div>
			<div class="p-4 bg-gradient-to-br from-accent to-accent/50 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105">
				<div class="flex items-center gap-2 mb-2">
					<div class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
					<p class="text-xs text-muted-foreground font-medium">Today</p>
				</div>
				<p class="text-2xl font-bold">{formatDuration($todayWorkData.totalMinutes)}</p>
			</div>
		</div>

		<!-- Chart Visualization -->
		{#if dailyTotals.length > 0}
			<div class="border-t pt-6">
				<h4 class="text-sm font-medium mb-4 flex items-center gap-2">
					<BarChart3 class="h-4 w-4" />
					Daily Breakdown
				</h4>
				<div class="bg-muted/30 p-4 rounded-xl">
					<BarChart data={chartData} height={250} />
				</div>
			</div>

			<!-- Detailed List -->
			<div class="border-t pt-4">
				<h4 class="text-sm font-medium mb-3">Details</h4>
				<div class="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
					{#each dailyTotals as day}
						{@const isToday = checkIsToday(day.date)}
						<div
							class="flex items-center justify-between p-3 rounded-lg transition-all duration-200 {isToday
								? 'bg-primary/10 border border-primary/20 shadow-sm'
								: 'bg-muted hover:bg-muted/70'}"
						>
							<div class="flex items-center gap-3">
								<span class="text-sm font-medium">
									{format(parseISO(day.date), 'EEE, MMM d')}
								</span>
								{#if isToday}
									<Badge variant="default" class="animate-pulse">Today</Badge>
								{/if}
							</div>
							<span class="text-sm font-semibold tabular-nums">
								{formatDuration(day.totalMinutes)}
							</span>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="text-center py-12 text-muted-foreground">
				<BarChart3 class="h-12 w-12 mx-auto mb-3 opacity-50" />
				<p class="font-medium">No work data available</p>
				<p class="text-sm">Start tracking your time to see analytics</p>
			</div>
		{/if}
	</div>
</Card>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	
	.custom-scrollbar::-webkit-scrollbar-track {
		background: hsl(var(--muted));
		border-radius: 3px;
	}
	
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: hsl(var(--primary) / 0.5);
		border-radius: 3px;
	}
	
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--primary));
	}
</style>

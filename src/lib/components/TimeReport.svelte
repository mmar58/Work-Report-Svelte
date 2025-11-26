<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { currentWeekData, previousWeekData, todayWorkData, viewMode } from '$lib/stores';
	import { formatDuration } from '$lib/utils/formatters';
	import { calculateDailyTotals, groupEntriesByDate } from '$lib/utils/calculations';
	import { format, parseISO } from 'date-fns';
	import { checkIsToday } from '$lib/utils/dateUtils';

	$: dailyTotals = calculateDailyTotals($currentWeekData.entries);
	$: viewModeLabel = $viewMode === 'week' ? 'Week' : $viewMode === 'month' ? 'Month' : 'Year';
</script>

<Card class="p-6">
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold">Time Report</h3>
			<Badge variant="outline">
				{viewModeLabel} View
			</Badge>
		</div>

		<!-- Summary Cards -->
		<div class="grid grid-cols-3 gap-4">
			<div class="p-4 bg-muted rounded-lg">
				<p class="text-xs text-muted-foreground mb-1">Current {viewModeLabel}</p>
				<p class="text-xl font-bold">{formatDuration($currentWeekData.totalMinutes)}</p>
			</div>
			<div class="p-4 bg-muted rounded-lg">
				<p class="text-xs text-muted-foreground mb-1">Previous {viewModeLabel}</p>
				<p class="text-xl font-bold">{formatDuration($previousWeekData.totalMinutes)}</p>
			</div>
			<div class="p-4 bg-muted rounded-lg">
				<p class="text-xs text-muted-foreground mb-1">Today</p>
				<p class="text-xl font-bold">{formatDuration($todayWorkData.totalMinutes)}</p>
			</div>
		</div>

		<!-- Daily Breakdown -->
		{#if dailyTotals.length > 0}
			<div class="border-t pt-4">
				<h4 class="text-sm font-medium mb-3">Daily Breakdown</h4>
				<div class="space-y-2 max-h-[400px] overflow-y-auto">
					{#each dailyTotals as day}
						{@const isToday = checkIsToday(day.date)}
						<div
							class="flex items-center justify-between p-3 rounded-lg transition-colors {isToday
								? 'bg-primary/10'
								: 'bg-muted'}"
						>
							<div class="flex items-center gap-3">
								<span class="text-sm font-medium">
									{format(parseISO(day.date), 'EEE, MMM d')}
								</span>
								{#if isToday}
									<Badge variant="default">Today</Badge>
								{/if}
							</div>
							<span class="text-sm font-semibold">
								{formatDuration(day.totalMinutes)}
							</span>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="text-center py-8 text-muted-foreground">
				<p>No work data available for this period</p>
			</div>
		{/if}
	</div>
</Card>

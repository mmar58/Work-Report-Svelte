<script lang="ts">
	import { ChevronLeft, ChevronRight, RefreshCw, Moon, Sun } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { theme } from '$lib/stores/ui';
	import { previousPeriod, nextPeriod, refreshWorkData, viewMode, dateRange } from '$lib/stores';
	import { formatDateRange } from '$lib/utils/dateUtils';
	import { isRefreshing } from '$lib/stores/ui';

	let isLoading = false;

	async function handleRefresh() {
		isLoading = true;
		isRefreshing.set(true);
		await refreshWorkData();
		isLoading = false;
		isRefreshing.set(false);
	}

	function handleThemeToggle() {
		theme.toggle();
	}

	$: dateRangeLabel = formatDateRange($dateRange, $viewMode);
</script>

<header class="border-b bg-background">
	<div class="flex items-center justify-between p-4">
		<div class="flex items-center gap-4">
			<h1 class="text-2xl font-bold">Work Report</h1>
			
			<div class="flex items-center gap-2">
				<Button variant="outline" size="icon" on:click={previousPeriod}>
					<ChevronLeft class="h-4 w-4" />
				</Button>
				
				<span class="text-sm font-medium min-w-[200px] text-center">
					{dateRangeLabel}
				</span>
				
				<Button variant="outline" size="icon" on:click={nextPeriod}>
					<ChevronRight class="h-4 w-4" />
				</Button>
			</div>

			<div class="flex gap-1 border rounded-md">
				<Button
					variant={$viewMode === 'week' ? 'default' : 'ghost'}
					size="sm"
					on:click={() => viewMode.set('week')}
				>
					Week
				</Button>
				<Button
					variant={$viewMode === 'month' ? 'default' : 'ghost'}
					size="sm"
					on:click={() => viewMode.set('month')}
				>
					Month
				</Button>
				<Button
					variant={$viewMode === 'year' ? 'default' : 'ghost'}
					size="sm"
					on:click={() => viewMode.set('year')}
				>
					Year
				</Button>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<Button variant="outline" size="icon" on:click={handleRefresh} disabled={isLoading}>
				<RefreshCw class="h-4 w-4 {isLoading ? 'animate-spin' : ''}" />
			</Button>
			
			<Button variant="outline" size="icon" on:click={handleThemeToggle}>
				{#if $theme === 'dark'}
					<Sun class="h-4 w-4" />
				{:else}
					<Moon class="h-4 w-4" />
				{/if}
			</Button>
		</div>
	</div>
</header>

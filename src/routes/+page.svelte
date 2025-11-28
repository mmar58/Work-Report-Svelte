<script lang="ts">
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import WorkGoalTracker from '$lib/components/WorkGoalTracker.svelte';
	import TimeReport from '$lib/components/TimeReport.svelte';
	import FloatingReport from '$lib/components/FloatingReport.svelte';
	import {
		loadWorkData,
		syncHourlyRateFromAPI,
		syncTargetHoursFromAPI,
		fetchCurrencyRate
	} from '$lib/stores';

	onMount(async () => {
		// Initialize all data on mount
		await Promise.all([
			loadWorkData(),
			syncHourlyRateFromAPI(),
			syncTargetHoursFromAPI(),
			fetchCurrencyRate()
		]);
	});
</script>

<div class="flex flex-col h-screen">
	<Header />
	
	<main class="flex-1 overflow-hidden">
		<div class="container mx-auto h-full p-4">
			<div class="grid lg:grid-cols-2 gap-6 h-full">
				<!-- Left Column -->
				<div class="space-y-6 overflow-y-auto">
					<div data-card>
						<WorkGoalTracker />
					</div>
					<div data-card>
						<FloatingReport />
					</div>
				</div>
				
				<!-- Right Column -->
				<div class="overflow-y-auto" data-card>
					<TimeReport />
				</div>
			</div>
		</div>
	</main>
</div>

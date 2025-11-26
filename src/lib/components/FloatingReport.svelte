<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Check, Copy } from '@lucide/svelte';
	import { settings, dateRange } from '$lib/stores';
	import { currentWeekData } from '$lib/stores';
	import { generateWorkReport } from '$lib/utils/calculations';
	import { formatDateISO } from '$lib/utils/dateUtils';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { shortDescription } from '$lib/stores/settings';

	let copied = false;

	$: report = generateWorkReport(
		formatDateISO($dateRange.startDate),
		formatDateISO($dateRange.endDate),
		$currentWeekData.totalMinutes,
		$settings.hourlyRate,
		$settings.dollarRate,
		$settings.shortDescription
	);

	async function copyReport() {
		try {
			await navigator.clipboard.writeText(report);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	function handleDescriptionChange(e: Event) {
		const target = e.target as HTMLInputElement;
		shortDescription.set(target.value);
	}
</script>

<Card class="p-6">
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold">Work Report</h3>
			<Button size="sm" on:click={copyReport}>
				{#if copied}
					<Check class="h-4 w-4 mr-2" />
					Copied!
				{:else}
					<Copy class="h-4 w-4 mr-2" />
					Copy Report
				{/if}
			</Button>
		</div>

		<div>
			<Label for="description">Short Description</Label>
			<Input
				id="description"
				value={$settings.shortDescription}
				on:input={handleDescriptionChange}
				placeholder="Enter work description..."
			/>
		</div>

		<Textarea value={report} rows={12} readonly class="font-mono text-sm" />
	</div>
</Card>
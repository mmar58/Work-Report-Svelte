<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Check, Copy, FileText } from '@lucide/svelte';
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

<Card class="p-6 overflow-hidden">
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<FileText class="h-5 w-5 text-primary" />
				<h3 class="text-lg font-semibold">Work Report</h3>
			</div>
			<Button 
				size="sm" 
				onclick={copyReport}
				class="transition-all duration-200 {copied ? 'bg-green-600 hover:bg-green-700' : ''}"
			>
				{#if copied}
					<Check class="h-4 w-4 mr-2 animate-in zoom-in duration-200" />
					Copied!
				{:else}
					<Copy class="h-4 w-4 mr-2" />
					Copy Report
				{/if}
			</Button>
		</div>

		<div class="space-y-2">
			<Label for="description" class="text-sm font-medium">Short Description</Label>
			<Input
				id="description"
				value={$settings.shortDescription}
				oninput={handleDescriptionChange}
				placeholder="Enter work description..."
				class="transition-all duration-200 focus:ring-2 focus:ring-primary"
			/>
		</div>

		<div class="relative">
			<Textarea 
				value={report} 
				rows={12} 
				readonly 
				class="font-mono text-sm bg-muted/30 transition-all duration-200 hover:bg-muted/50" 
			/>
			{#if copied}
				<div class="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-md text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-300">
					✓ Copied to clipboard
				</div>
			{/if}
		</div>
	</div>
</Card>
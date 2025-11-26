<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { settings, updateHourlyRate, updateTargetHours } from '$lib/stores';
	import { currentWeekData } from '$lib/stores';
	import { formatDuration, formatMoney, calculatePercentage } from '$lib/utils/formatters';
	import {
		calculateEarnings,
		calculateEarningsInBDT,
		calculateRemainingDays,
		calculateRequiredHoursPerDay,
		calculateProgress
	} from '$lib/utils/calculations';

	let editingRate = false;
	let editingTarget = false;
	let rateInput = $settings.hourlyRate;
	let targetInput = $settings.targetHours;

	async function saveHourlyRate() {
		const success = await updateHourlyRate(rateInput);
		if (success) {
			editingRate = false;
		}
	}

	async function saveTargetHours() {
		const success = await updateTargetHours(targetInput);
		if (success) {
			editingTarget = false;
		}
	}

	$: progress = calculateProgress($currentWeekData.totalMinutes, $settings.targetHours);
	$: earningsUSD = calculateEarnings($currentWeekData.totalMinutes, $settings.hourlyRate);
	$: earningsBDT = calculateEarningsInBDT(
		$currentWeekData.totalMinutes,
		$settings.hourlyRate,
		$settings.dollarRate
	);
	$: remainingDays = calculateRemainingDays();
	$: requiredHoursPerDay = calculateRequiredHoursPerDay(
		$settings.targetHours,
		$currentWeekData.totalMinutes,
		remainingDays
	);
</script>

<Card class="p-6">
	<div class="space-y-6">
		<!-- Progress Bar -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-medium">Weekly Progress</h3>
				<Badge variant={progress >= 100 ? 'default' : 'secondary'}>
					{progress}%
				</Badge>
			</div>
			<Progress value={progress} class="h-2" />
		</div>

		<!-- Time Stats -->
		<div class="grid grid-cols-2 gap-4">
			<div>
				<p class="text-sm text-muted-foreground">Hours Worked</p>
				<p class="text-2xl font-bold">{formatDuration($currentWeekData.totalMinutes)}</p>
			</div>
			<div>
				<p class="text-sm text-muted-foreground">Target Hours</p>
				<div class="flex items-center gap-2">
					{#if editingTarget}
						<Input
							type="number"
							bind:value={targetInput}
							class="w-20 h-8"
							min="0"
							max="168"
						/>
						<Button size="sm" on:click={saveTargetHours}>Save</Button>
						<Button size="sm" variant="ghost" on:click={() => (editingTarget = false)}>
							Cancel
						</Button>
					{:else}
						<p class="text-2xl font-bold">{$settings.targetHours}h</p>
						<Button size="sm" variant="ghost" on:click={() => (editingTarget = true)}>
							Edit
						</Button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Earnings -->
		<div>
			<div class="flex items-center justify-between mb-2">
				<p class="text-sm text-muted-foreground">Total Earnings</p>
				{#if !editingRate}
					<Button size="sm" variant="ghost" on:click={() => (editingRate = true)}>
						Edit Rate
					</Button>
				{/if}
			</div>
			
			{#if editingRate}
				<div class="flex items-center gap-2 mb-2">
					<Label>Hourly Rate ($):</Label>
					<Input type="number" bind:value={rateInput} class="w-24" min="0" step="0.5" />
					<Button size="sm" on:click={saveHourlyRate}>Save</Button>
					<Button size="sm" variant="ghost" on:click={() => (editingRate = false)}>
						Cancel
					</Button>
				</div>
			{/if}
			
			<div class="space-y-1">
				<p class="text-xl font-bold">{formatMoney(earningsUSD, 'USD')}</p>
				<p class="text-sm text-muted-foreground">
					৳{earningsBDT.toLocaleString('en-US', { maximumFractionDigits: 0 })} BDT
				</p>
			</div>
		</div>

		<!-- Remaining Work -->
		{#if remainingDays > 0 && requiredHoursPerDay > 0}
			<div class="border-t pt-4">
				<p class="text-sm text-muted-foreground mb-2">To Meet Target</p>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<p class="text-xs text-muted-foreground">Days Remaining</p>
						<p class="text-lg font-semibold">{remainingDays}</p>
					</div>
					<div>
						<p class="text-xs text-muted-foreground">Hours Needed/Day</p>
						<p class="text-lg font-semibold">
							{requiredHoursPerDay.toFixed(1)}h
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</Card>

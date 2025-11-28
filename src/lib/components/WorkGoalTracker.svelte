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
	import CircularProgress from './CircularProgress.svelte';
	import { Target, DollarSign, Clock, Edit, Check, X, Zap } from '@lucide/svelte';

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
	$: hoursWorked = $currentWeekData.totalMinutes / 60;
</script>

<Card class="p-6 overflow-hidden">
	<div class="space-y-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Target class="h-5 w-5 text-primary" />
				<h3 class="text-lg font-semibold">Weekly Goal</h3>
			</div>
			<Badge variant={progress >= 100 ? 'default' : 'secondary'} class="animate-in fade-in duration-300">
				{progress}%
			</Badge>
		</div>

		<!-- Circular Progress Center -->
		<div class="flex justify-center py-4">
			<div class="relative">
				<CircularProgress 
					value={hoursWorked} 
					max={$settings.targetHours} 
					size={200}
					strokeWidth={16}
					showPercentage={false}
				/>
				<div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
					<div class="text-3xl font-bold">
						{hoursWorked.toFixed(1)}h
					</div>
					<div class="text-sm text-muted-foreground mt-1">
						of {$settings.targetHours}h
					</div>
				</div>
			</div>
		</div>

		<!-- Progress Bar -->
		<div class="space-y-2">
			<Progress value={progress} class="h-3 transition-all duration-500" />
			<div class="flex items-center justify-between text-xs text-muted-foreground">
				<span>0h</span>
				<span class="font-medium text-primary">{formatDuration($currentWeekData.totalMinutes)}</span>
				<span>{$settings.targetHours}h</span>
			</div>
		</div>

		<!-- Stats Grid -->
		<div class="grid grid-cols-2 gap-4">
			<!-- Target Hours Card -->
			<div class="p-4 bg-gradient-to-br from-muted to-muted/50 rounded-xl border transition-all duration-300 hover:shadow-md">
				<div class="flex items-center gap-2 mb-2">
					<Target class="h-4 w-4 text-primary" />
					<p class="text-xs text-muted-foreground font-medium">Target</p>
				</div>
				{#if editingTarget}
					<div class="flex items-center gap-1">
						<Input
							type="number"
							bind:value={targetInput}
							class="w-16 h-8 text-sm"
							min="0"
							max="168"
						/>
						<Button size="icon-sm" variant="ghost" onclick={saveTargetHours}>
							<Check class="h-3 w-3" />
						</Button>
						<Button size="icon-sm" variant="ghost" onclick={() => (editingTarget = false)}>
							<X class="h-3 w-3" />
						</Button>
					</div>
				{:else}
					<div class="flex items-center gap-2">
						<p class="text-xl font-bold">{$settings.targetHours}h</p>
						<Button size="icon-sm" variant="ghost" onclick={() => (editingTarget = true)}>
							<Edit class="h-3 w-3" />
						</Button>
					</div>
				{/if}
			</div>

			<!-- Hourly Rate Card -->
			<div class="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl border border-green-200 dark:border-green-800 transition-all duration-300 hover:shadow-md">
				<div class="flex items-center gap-2 mb-2">
					<DollarSign class="h-4 w-4 text-green-600 dark:text-green-400" />
					<p class="text-xs text-muted-foreground font-medium">Hourly Rate</p>
				</div>
				{#if editingRate}
					<div class="flex items-center gap-1">
						<Input type="number" bind:value={rateInput} class="w-16 h-8 text-sm" min="0" step="0.5" />
						<Button size="icon-sm" variant="ghost" onclick={saveHourlyRate}>
							<Check class="h-3 w-3" />
						</Button>
						<Button size="icon-sm" variant="ghost" onclick={() => (editingRate = false)}>
							<X class="h-3 w-3" />
						</Button>
					</div>
				{:else}
					<div class="flex items-center gap-2">
						<p class="text-xl font-bold text-green-700 dark:text-green-300">${$settings.hourlyRate}</p>
						<Button size="icon-sm" variant="ghost" onclick={() => (editingRate = true)}>
							<Edit class="h-3 w-3" />
						</Button>
					</div>
				{/if}
			</div>
		</div>

		<!-- Earnings Section -->
		<div class="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
			<div class="flex items-center gap-2 mb-3">
				<DollarSign class="h-4 w-4 text-primary" />
				<p class="text-sm text-muted-foreground font-medium">Total Earnings</p>
			</div>
			<div class="space-y-1">
				<p class="text-2xl font-bold text-primary">{formatMoney(earningsUSD, 'USD')}</p>
				<p class="text-sm text-muted-foreground">
					৳{earningsBDT.toLocaleString('en-US', { maximumFractionDigits: 0 })} BDT
				</p>
			</div>
		</div>

		<!-- Remaining Work -->
		{#if remainingDays > 0 && requiredHoursPerDay > 0}
			<div class="border-t pt-4">
				<div class="flex items-center gap-2 mb-3">
					<Zap class="h-4 w-4 text-amber-500" />
					<p class="text-sm font-medium">To Meet Target</p>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="p-3 bg-muted/50 rounded-lg">
						<div class="flex items-center gap-2 mb-1">
							<Clock class="h-3 w-3 text-muted-foreground" />
							<p class="text-xs text-muted-foreground">Days Left</p>
						</div>
						<p class="text-2xl font-semibold">{remainingDays}</p>
					</div>
					<div class="p-3 bg-muted/50 rounded-lg">
						<div class="flex items-center gap-2 mb-1">
							<Zap class="h-3 w-3 text-amber-500" />
							<p class="text-xs text-muted-foreground">Needed/Day</p>
						</div>
						<p class="text-2xl font-semibold text-amber-600 dark:text-amber-400">
							{requiredHoursPerDay.toFixed(1)}h
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</Card>

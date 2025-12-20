<script lang="ts">
    import { settings } from "$lib/stores/settings";
    import { currentWeekData } from "$lib/stores/workData";
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Progress } from "$lib/components/ui/progress";
    import {
        calculateRemainingDays,
        calculateRequiredDaily,
    } from "$lib/utils/calculations";
    import { Target, CalendarDays, Zap } from "lucide-svelte";

    let weeklyHours = $derived(
        Number($currentWeekData.totalHours) +
            Number($currentWeekData.totalMinutes) / 60,
    );
    let targetHours = $derived($settings.targetHours);
    let percentage = $derived(Math.min(100, (weeklyHours / targetHours) * 100));

    let remainingDays = $derived(calculateRemainingDays());
    let currentTotalMinutes = $derived(
        $currentWeekData.totalHours * 60 + $currentWeekData.totalMinutes,
    );
    let requiredDaily = $derived(
        calculateRequiredDaily(currentTotalMinutes, targetHours, remainingDays),
    );

    let isGoalMet = $derived(weeklyHours >= targetHours);

    // Safe color derivation based on percentage
    let progressColor = $derived(
        percentage >= 100
            ? "bg-green-500"
            : percentage >= 75
              ? "bg-blue-500"
              : percentage >= 50
                ? "bg-yellow-500"
                : "bg-primary",
    );
</script>

<Card class="w-full shadow-sm border-none bg-secondary/5">
    <CardHeader class="pb-2">
        <CardTitle
            class="text-sm font-medium text-muted-foreground flex items-center gap-2"
        >
            <Target class="h-4 w-4" /> Weekly Goal
        </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
        <div class="flex justify-between items-end">
            <div class="text-2xl font-bold">
                {Math.floor(percentage)}%
            </div>
            <div class="text-sm text-muted-foreground">
                {weeklyHours.toFixed(1)} / {targetHours} hrs
            </div>
        </div>

        <Progress value={percentage} max={100} class="h-2" />

        {#if !isGoalMet && remainingDays > 0}
            <div class="grid grid-cols-2 gap-2 pt-2">
                <div
                    class="bg-card rounded-lg p-2.5 flex flex-col items-center justify-center text-center shadow-sm"
                >
                    <CalendarDays class="h-4 w-4 text-muted-foreground mb-1" />
                    <span class="text-xs text-muted-foreground">Days Left</span>
                    <span class="font-bold">{remainingDays}</span>
                </div>
                <div
                    class="bg-card rounded-lg p-2.5 flex flex-col items-center justify-center text-center shadow-sm"
                >
                    <Zap class="h-4 w-4 text-yellow-500 mb-1" />
                    <span class="text-xs text-muted-foreground"
                        >Daily Target</span
                    >
                    <span class="font-bold text-primary"
                        >{requiredDaily.hours}h {requiredDaily.minutes}m</span
                    >
                </div>
            </div>
        {:else if isGoalMet}
            <div
                class="bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg p-3 text-center text-sm font-medium"
            >
                🎉 Weekly goal achieved!
            </div>
        {/if}
    </CardContent>
</Card>

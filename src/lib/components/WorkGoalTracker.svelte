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

<div class="h-full flex flex-col modern-card rounded-xl p-5 gap-4">
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
            <div class="p-1.5 rounded-full bg-primary/10 text-primary">
                <Target size={14} />
            </div>
            <span
                class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >Weekly Goal</span
            >
        </div>
        <span class="text-xs font-mono text-muted-foreground"
            >{targetHours}h Target</span
        >
    </div>

    <!-- Minimal Progress Ring/Bar -->
    <div class="space-y-2">
        <div class="flex items-end justify-between">
            <span class="text-4xl font-bold tracking-tighter"
                >{percentage.toFixed(0)}%</span
            >
            <span class="text-xs font-medium text-muted-foreground mb-1.5">
                {weeklyHours.toFixed(1)} / {targetHours} hrs
            </span>
        </div>
        <Progress value={percentage} class="h-2" />
    </div>

    <div class="grid grid-cols-2 gap-3 mt-auto">
        <div
            class="p-3 rounded-lg bg-secondary/30 border border-border/50 flex flex-col gap-1 items-center justify-center text-center"
        >
            <CalendarDays size={16} class="text-muted-foreground mb-1" />
            <span
                class="text-[10px] text-muted-foreground uppercase tracking-wide"
                >Days Left</span
            >
            <span class="text-lg font-bold">{remainingDays}</span>
        </div>
        <div
            class="p-3 rounded-lg bg-secondary/30 border border-border/50 flex flex-col gap-1 items-center justify-center text-center"
        >
            <Zap size={16} class="text-amber-500 mb-1" />
            <span
                class="text-[10px] text-muted-foreground uppercase tracking-wide"
                >Daily Target</span
            >
            <span class="text-lg font-bold"
                >{requiredDaily.hours}h {requiredDaily.minutes}m</span
            >
        </div>
    </div>
</div>

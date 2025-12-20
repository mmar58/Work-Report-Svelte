<script lang="ts">
    import {
        currentWeekData,
        previousWeekData,
        viewMode,
    } from "$lib/stores/workData";
    import { settings } from "$lib/stores/settings";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { Separator } from "$lib/components/ui/separator";
    import { formatDuration, formatMoney } from "$lib/utils/formatters";
    import { calculateEarnings } from "$lib/utils/calculations";
    import { ArrowUp, ArrowDown, Clock, DollarSign } from "lucide-svelte";

    // Reactive calculations
    let currentHours = $derived($currentWeekData.totalHours);
    let currentMinutes = $derived($currentWeekData.totalMinutes);
    let prevHours = $derived($previousWeekData.totalHours);
    let prevMinutes = $derived($previousWeekData.totalMinutes);

    let currentTotalMinutes = $derived(currentHours * 60 + currentMinutes);
    let prevTotalMinutes = $derived(prevHours * 60 + prevMinutes);

    let currentEarnings = $derived(
        calculateEarnings(currentHours, currentMinutes, $settings.hourlyRate),
    );
    let prevEarnings = $derived(
        calculateEarnings(prevHours, prevMinutes, $settings.hourlyRate),
    );
    let currentEarningsBDT = $derived(currentEarnings * $settings.dollarRate);

    // Comparisons
    let timeDiff = $derived(currentTotalMinutes - prevTotalMinutes);
    let isPositive = $derived(timeDiff >= 0);
    let diffStr = $derived(formatDuration(Math.abs(timeDiff)));

    let modeLabel = $derived(
        $viewMode === "week"
            ? "Week"
            : $viewMode === "month"
              ? "Month"
              : "Year",
    );
    let prevLabel = $derived(
        $viewMode === "week"
            ? "Last Week"
            : $viewMode === "month"
              ? "Last Month"
              : "Last Year",
    );
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
    <!-- Current Period -->
    <Card
        class="relative overflow-hidden border-none shadow-md bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20"
    >
        <CardContent class="p-6 flex flex-col justify-between h-full">
            <div class="space-y-1">
                <span
                    class="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2"
                >
                    <Clock class="h-3 w-3" /> Current {modeLabel}
                </span>
                <div
                    class="text-5xl font-bold tracking-tighter tabular-nums text-primary mt-2"
                >
                    {currentHours}<span
                        class="text-2xl text-muted-foreground font-normal"
                        >h</span
                    >
                    {currentMinutes}<span
                        class="text-2xl text-muted-foreground font-normal"
                        >m</span
                    >
                </div>
            </div>

            <div class="mt-4 pt-4 border-t border-primary/10">
                <div class="flex justify-between items-end">
                    <div>
                        <p class="text-sm text-muted-foreground mb-1">
                            Estimated Earnings
                        </p>
                        <div
                            class="text-xl font-bold text-foreground flex items-center gap-1"
                        >
                            <DollarSign class="h-4 w-4 text-green-500" />
                            {formatMoney(currentEarnings)}
                        </div>
                        {#if $settings.dollarRate > 0}
                            <p class="text-xs text-muted-foreground mt-1">
                                ৳ {formatMoney(currentEarningsBDT, "BDT")}
                            </p>
                        {/if}
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>

    <!-- Previous Period Comparison -->
    <Card class="bg-card/50">
        <CardContent class="p-6 flex flex-col justify-center h-full gap-4">
            <div class="space-y-1">
                <span
                    class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                    >{prevLabel}</span
                >
                <div
                    class="text-2xl font-semibold tabular-nums text-muted-foreground"
                >
                    {prevHours}h {prevMinutes}m
                </div>
                <div class="text-sm text-muted-foreground">
                    Earnings: {formatMoney(prevEarnings)}
                </div>
            </div>

            <Separator />

            <div class="flex items-center gap-3">
                <div
                    class="h-10 w-10 rounded-full flex items-center justify-center {isPositive
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'}"
                >
                    {#if isPositive}
                        <ArrowUp class="h-5 w-5" />
                    {:else}
                        <ArrowDown class="h-5 w-5" />
                    {/if}
                </div>
                <div>
                    <div
                        class="font-medium {isPositive
                            ? 'text-green-500'
                            : 'text-red-500'}"
                    >
                        {isPositive ? "+" : "-"}{diffStr}
                    </div>
                    <div class="text-xs text-muted-foreground">
                        vs previous {modeLabel.toLowerCase()}
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
</div>

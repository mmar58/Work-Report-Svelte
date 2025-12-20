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

<div
    class="h-full flex flex-col justify-between modern-card rounded-xl p-5 relative overflow-hidden group"
>
    <!-- Ambient mesh gradient background -->
    <div
        class="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"
    ></div>

    <div>
        <h3
            class="font-medium text-xs uppercase tracking-widest text-muted-foreground mb-1"
        >
            Current {modeLabel}
        </h3>
        <div class="flex items-baseline gap-1 mt-1 z-10 relative">
            <span class="text-5xl font-bold tracking-tighter text-foreground">
                {currentHours}
            </span>
            <span
                class="text-xl font-medium text-muted-foreground translate-y-[-4px]"
                >h</span
            >
            <span
                class="text-3xl font-bold tracking-tighter text-foreground ml-2"
            >
                {currentMinutes}
            </span>
            <span
                class="text-lg font-medium text-muted-foreground translate-y-[-2px]"
                >m</span
            >
        </div>

        <div class="mt-4 flex flex-col gap-0.5 z-10 relative">
            <span class="text-xs text-muted-foreground font-medium"
                >Estimated Earnings</span
            >
            <span
                class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600"
            >
                {formatMoney(currentEarnings)}
            </span>
            {#if $settings.dollarRate > 0}
                <span class="text-[10px] text-muted-foreground/60 font-mono">
                    ৳ {formatMoney(currentEarningsBDT, "BDT")}
                </span>
            {/if}
        </div>
    </div>

    <!-- Comparison Section -->
    <div class="mt-6 pt-4 border-t border-border/40 space-y-3 z-10 relative">
        <div
            class="flex items-center justify-between text-xs text-muted-foreground"
        >
            <span>{prevLabel}</span>
            <span class="font-mono">{prevHours}h {prevMinutes}m</span>
        </div>
        <div class="flex items-center gap-2">
            <div
                class="flex items-center gap-1.5 {isPositive
                    ? 'text-green-500'
                    : 'text-red-500'} bg-card/60 px-2 py-1 rounded-full shadow-sm border border-border/50"
            >
                {#if isPositive}
                    <ArrowUp size={12} strokeWidth={3} />
                {:else}
                    <ArrowDown size={12} strokeWidth={3} />
                {/if}
                <span class="text-xs font-bold">{diffStr}</span>
            </div>
            <span class="text-[10px] text-muted-foreground/50"
                >vs previous period</span
            >
        </div>
    </div>
</div>

<script lang="ts">
    import {
        currentWeekData,
        previousWeekData,
        viewMode,
    } from "$lib/stores/workData";
    import { settings, fetchCurrencyRate } from "$lib/stores/settings";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { Separator } from "$lib/components/ui/separator";
    import { formatDuration, formatMoney } from "$lib/utils/formatters";
    import { calculateEarnings } from "$lib/utils/calculations";
    import { ArrowUp, ArrowDown, Clock, DollarSign } from "lucide-svelte";
    import { onMount } from "svelte";

    onMount(() => {
        fetchCurrencyRate();
    });

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

    let currentEarningsUSD = $derived(
        $settings.dollarRate > 0 ? currentEarnings / $settings.dollarRate : 0,
    );

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
    class="h-full flex flex-col justify-between modern-card rounded-xl p-4 relative overflow-hidden group"
>
    <!-- Ambient mesh gradient background -->
    <div
        class="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"
    ></div>

    <div>
        <h3
            class="font-medium text-[10px] uppercase tracking-widest text-muted-foreground mb-1"
        >
            Current {modeLabel}
        </h3>
        <div class="flex items-baseline gap-1 mt-0.5 z-10 relative">
            <span class="text-4xl font-bold tracking-tighter text-foreground">
                {currentHours}
            </span>
            <span
                class="text-lg font-medium text-muted-foreground translate-y-[-3px]"
                >h</span
            >
            <span
                class="text-2xl font-bold tracking-tighter text-foreground ml-1.5"
            >
                {currentMinutes}
            </span>
            <span
                class="text-sm font-medium text-muted-foreground translate-y-[-2px]"
                >m</span
            >
        </div>

        <div class="mt-3 flex flex-col gap-0 z-10 relative">
            <span class="text-[10px] text-muted-foreground font-medium"
                >Estimated Earnings</span
            >
            <div class="flex items-baseline gap-2 flex-wrap">
                <span
                    class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 leading-tight"
                >
                    {formatMoney(currentEarnings, "BDT")}
                </span>
                {#if $settings.dollarRate > 0}
                    <span class="text-sm text-muted-foreground/80 font-medium">
                        ({formatMoney(currentEarningsUSD, "USD")})
                    </span>
                {/if}
            </div>
            {#if $settings.dollarRate > 0}
                <span
                    class="text-[9px] text-muted-foreground/60 font-mono mt-0.5"
                >
                    1 USD = {formatMoney($settings.dollarRate, "BDT")}
                </span>
            {/if}
        </div>
    </div>

    <!-- Comparison Section -->
    <div class="mt-4 pt-3 border-t border-border/40 space-y-2 z-10 relative">
        <div
            class="flex items-center justify-between text-[11px] text-muted-foreground"
        >
            <span>{prevLabel}</span>
            <span class="font-mono">{prevHours}h {prevMinutes}m</span>
        </div>
        <div class="flex items-center gap-1.5">
            <div
                class="flex items-center gap-1 {isPositive
                    ? 'text-green-500'
                    : 'text-red-500'} bg-card/60 px-1.5 py-0.5 rounded-full shadow-sm border border-border/50"
            >
                {#if isPositive}
                    <ArrowUp size={10} strokeWidth={3} />
                {:else}
                    <ArrowDown size={10} strokeWidth={3} />
                {/if}
                <span class="text-[10px] font-bold">{diffStr}</span>
            </div>
            <span class="text-[9px] text-muted-foreground/50">vs previous</span>
        </div>
    </div>
</div>

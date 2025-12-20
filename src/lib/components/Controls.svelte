<script lang="ts">
    import { viewMode, dateRange, loadWorkData } from "$lib/stores/workData";
    import { Button } from "$lib/components/ui/button";
    import {
        ChevronLeft,
        ChevronRight,
        Calendar,
        RotateCw,
    } from "lucide-svelte";
    import {
        addWeeks,
        subWeeks,
        addMonths,
        subMonths,
        addYears,
        subYears,
        format,
        startOfWeek,
        endOfWeek,
    } from "date-fns";
    import * as Select from "$lib/components/ui/select";

    let isLoading = false;

    async function handleRefresh() {
        isLoading = true;
        await loadWorkData();
        isLoading = false;
    }

    function handlePrev() {
        if ($viewMode === "week") {
            $dateRange.startDate = subWeeks($dateRange.startDate, 1);
            $dateRange.endDate = subWeeks($dateRange.endDate, 1);
        } else if ($viewMode === "month") {
            // Logic for month navigation
        }
        loadWorkData();
    }

    function handleNext() {
        if ($viewMode === "week") {
            $dateRange.startDate = addWeeks($dateRange.startDate, 1);
            $dateRange.endDate = addWeeks($dateRange.endDate, 1);
        }
        loadWorkData();
    }

    let formattedRange = $derived(
        `${format($dateRange.startDate, "MMM d")} - ${format($dateRange.endDate, "MMM d, yyyy")}`,
    );
</script>

<div
    class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 rounded-xl bg-card/30 p-2 backdrop-blur-sm border border-border/50 shadow-sm"
>
    <div
        class="flex items-center gap-2 bg-background/50 rounded-lg p-1 border shadow-inner"
    >
        <Button variant="ghost" size="icon-sm" onclick={handlePrev}>
            <ChevronLeft class="h-4 w-4" />
        </Button>
        <div
            class="flex items-center gap-2 px-2 min-w-[180px] justify-center font-medium"
        >
            <Calendar class="h-4 w-4 text-muted-foreground" />
            <span>{formattedRange}</span>
        </div>
        <Button variant="ghost" size="icon-sm" onclick={handleNext}>
            <ChevronRight class="h-4 w-4" />
        </Button>
    </div>

    <div class="flex items-center gap-3">
        <div
            class="flex bg-background/50 rounded-lg p-1 border shadow-inner items-center"
        >
            <Button
                variant={$viewMode === "week" ? "secondary" : "ghost"}
                size="sm"
                onclick={() => ($viewMode = "week")}
                class="h-7 text-xs">Week</Button
            >
            <Button
                variant={$viewMode === "month" ? "secondary" : "ghost"}
                size="sm"
                onclick={() => ($viewMode = "month")}
                class="h-7 text-xs">Month</Button
            >
            <Button
                variant={$viewMode === "year" ? "secondary" : "ghost"}
                size="sm"
                onclick={() => ($viewMode = "year")}
                class="h-7 text-xs">Year</Button
            >
        </div>

        <Button
            variant="outline"
            size="sm"
            onclick={handleRefresh}
            disabled={isLoading}
            class="gap-2"
        >
            <RotateCw class="h-3.5 w-3.5 {isLoading ? 'animate-spin' : ''}" />
            <span class="hidden sm:inline">Refresh Data</span>
        </Button>
    </div>
</div>

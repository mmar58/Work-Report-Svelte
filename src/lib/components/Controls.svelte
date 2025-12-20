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
        startOfMonth,
        endOfMonth,
        startOfYear,
        endOfYear,
    } from "date-fns";

    let isLoading = false;

    async function handleRefresh() {
        isLoading = true;
        await loadWorkData();
        isLoading = false;
    }

    function setMode(mode: "week" | "month" | "year") {
        const now = new Date();
        $viewMode = mode;

        if (mode === "week") {
            $dateRange = {
                startDate: startOfWeek(now, { weekStartsOn: 1 }),
                endDate: endOfWeek(now, { weekStartsOn: 1 }),
            };
        } else if (mode === "month") {
            $dateRange = {
                startDate: startOfMonth(now),
                endDate: endOfMonth(now),
            };
        } else if (mode === "year") {
            $dateRange = {
                startDate: startOfYear(now),
                endDate: endOfYear(now),
            };
        }
        loadWorkData();
    }

    function handlePrev() {
        const { startDate, endDate } = $dateRange;
        if ($viewMode === "week") {
            $dateRange = {
                startDate: subWeeks(startDate, 1),
                endDate: subWeeks(endDate, 1),
            };
        } else if ($viewMode === "month") {
            const prevMonth = subMonths(startDate, 1);
            $dateRange = {
                startDate: startOfMonth(prevMonth),
                endDate: endOfMonth(prevMonth),
            };
        } else if ($viewMode === "year") {
            const prevYear = subYears(startDate, 1);
            $dateRange = {
                startDate: startOfYear(prevYear),
                endDate: endOfYear(prevYear),
            };
        }
        loadWorkData();
    }

    function handleNext() {
        const { startDate, endDate } = $dateRange;
        if ($viewMode === "week") {
            $dateRange = {
                startDate: addWeeks(startDate, 1),
                endDate: addWeeks(endDate, 1),
            };
        } else if ($viewMode === "month") {
            const nextMonth = addMonths(startDate, 1);
            $dateRange = {
                startDate: startOfMonth(nextMonth),
                endDate: endOfMonth(nextMonth),
            };
        } else if ($viewMode === "year") {
            const nextYear = addYears(startDate, 1);
            $dateRange = {
                startDate: startOfYear(nextYear),
                endDate: endOfYear(nextYear),
            };
        }
        loadWorkData();
    }

    let formattedRange = $derived.by(() => {
        if ($viewMode === "year") {
            return format($dateRange.startDate, "yyyy");
        }
        if ($viewMode === "month") {
            return format($dateRange.startDate, "MMMM yyyy");
        }
        return `${format($dateRange.startDate, "MMM d")} - ${format($dateRange.endDate, "MMM d, yyyy")}`;
    });
</script>

<div
    class="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 rounded-xl bg-card/30 p-2 backdrop-blur-sm border border-border/50 shadow-sm"
>
    <!-- Navigation Controls -->
    <div
        class="flex items-center gap-2 bg-background/50 rounded-lg p-1 border shadow-inner"
    >
        <Button
            variant="ghost"
            size="icon"
            onclick={handlePrev}
            class="h-8 w-8"
        >
            <ChevronLeft class="h-4 w-4" />
        </Button>
        <div
            class="flex items-center gap-2 px-3 min-w-[200px] justify-center font-medium font-mono text-sm"
        >
            <Calendar class="h-4 w-4 text-muted-foreground" />
            <span>{formattedRange}</span>
        </div>
        <Button
            variant="ghost"
            size="icon"
            onclick={handleNext}
            class="h-8 w-8"
        >
            <ChevronRight class="h-4 w-4" />
        </Button>
    </div>

    <div class="flex items-center gap-3">
        <!-- View Mode Switcher -->
        <div
            class="flex bg-background/50 rounded-lg p-1 border shadow-inner items-center"
        >
            <Button
                variant={$viewMode === "week" ? "secondary" : "ghost"}
                size="sm"
                onclick={() => setMode("week")}
                class="h-7 text-xs px-3 transition-all">Week</Button
            >
            <Button
                variant={$viewMode === "month" ? "secondary" : "ghost"}
                size="sm"
                onclick={() => setMode("month")}
                class="h-7 text-xs px-3 transition-all">Month</Button
            >
            <Button
                variant={$viewMode === "year" ? "secondary" : "ghost"}
                size="sm"
                onclick={() => setMode("year")}
                class="h-7 text-xs px-3 transition-all">Year</Button
            >
        </div>

        <!-- Refresh Button -->
        <Button
            variant="outline"
            size="sm"
            onclick={handleRefresh}
            disabled={isLoading}
            class="gap-2 h-9"
        >
            <RotateCw class="h-3.5 w-3.5 {isLoading ? 'animate-spin' : ''}" />
            <span class="hidden sm:inline">Refresh</span>
        </Button>
    </div>
</div>

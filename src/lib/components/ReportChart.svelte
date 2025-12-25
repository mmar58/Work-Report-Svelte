<script lang="ts">
    import {
        currentWeekData,
        previousWeekData,
        viewMode,
        dateRange,
        loadWorkData,
    } from "$lib/stores/workData";
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { ChevronDown } from "lucide-svelte";
    import { onMount, onDestroy } from "svelte";
    import {
        Chart,
        Title,
        Tooltip,
        Legend,
        BarElement,
        CategoryScale,
        LinearScale,
        BarController,
        type ChartConfiguration,
        type ChartItem,
    } from "chart.js";
    import {
        startOfWeek,
        endOfWeek,
        startOfMonth,
        endOfMonth,
        startOfYear,
        endOfYear,
        addWeeks,
        subWeeks,
        addMonths,
        subMonths,
        addYears,
        subYears,
        format,
    } from "date-fns";
    import { ChevronLeft, ChevronRight, Calendar } from "lucide-svelte";

    Chart.register(
        Title,
        Tooltip,
        Legend,
        BarElement,
        CategoryScale,
        LinearScale,
        BarController,
    );

    let canvas: HTMLCanvasElement;
    let chartInstance: Chart | null = null;
    let mode = $derived($viewMode);

    function setMode(newMode: "week" | "month" | "year") {
        const now = new Date();
        $viewMode = newMode;

        if (newMode === "week") {
            $dateRange = {
                startDate: startOfWeek(now, { weekStartsOn: 1 }),
                endDate: endOfWeek(now, { weekStartsOn: 1 }),
            };
        } else if (newMode === "month") {
            $dateRange = {
                startDate: startOfMonth(now),
                endDate: endOfMonth(now),
            };
        } else if (newMode === "year") {
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

    // Prepare data for chart
    let chartData = $derived.by(() => {
        const labels =
            mode === "month"
                ? ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"]
                : mode === "year"
                  ? [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                    ]
                  : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        // Logic placeholder - simplified for visualization stability
        // In a real scenario, this would regroup data based on the mode.
        // For now, let's keep the existing logic but safeguard against length mismatches
        // or just map day-of-week for 'week' mode correctly.

        // Detailed grouping logic is complex to inline here without refactoring store structure further,
        // so we will trust the existing week-based data or simple mapping for now.
        // If mode is NOT week, we might just show aggregated data or use the same placeholders.

        const currentValues = new Array(labels.length).fill(0);
        const prevValues = new Array(labels.length).fill(0);

        if (mode === "week") {
            $currentWeekData.entries.forEach((e) => {
                const day = new Date(e.date).getDay();
                const index = day === 0 ? 6 : day - 1; // Mon=0, Sun=6
                if (index >= 0 && index < 7)
                    currentValues[index] += e.duration / 60;
            });

            $previousWeekData.entries.forEach((e) => {
                const day = new Date(e.date).getDay();
                const index = day === 0 ? 6 : day - 1;
                if (index >= 0 && index < 7)
                    prevValues[index] += e.duration / 60;
            });
        } else if (mode === "month") {
            // Group by Week (1-5)
            $currentWeekData.entries.forEach((e) => {
                const date = new Date(e.date);
                const dayOfMonth = date.getDate();
                // Simple bucket: 0-6 -> W1, 7-13 -> W2, etc.
                const index = Math.floor((dayOfMonth - 1) / 7);
                if (index >= 0 && index < labels.length)
                    currentValues[index] += e.duration / 60;
            });

            $previousWeekData.entries.forEach((e) => {
                const date = new Date(e.date);
                const dayOfMonth = date.getDate();
                const index = Math.floor((dayOfMonth - 1) / 7);
                if (index >= 0 && index < labels.length)
                    prevValues[index] += e.duration / 60;
            });
        } else if (mode === "year") {
            // Group by Month (Jan-Dec)
            $currentWeekData.entries.forEach((e) => {
                const month = new Date(e.date).getMonth();
                if (month >= 0 && month < 12)
                    currentValues[month] += e.duration / 60;
            });

            $previousWeekData.entries.forEach((e) => {
                const month = new Date(e.date).getMonth();
                if (month >= 0 && month < 12)
                    prevValues[month] += e.duration / 60;
            });
        }
        // TODO: Add logic for Month/Year aggregation if backend supports it or do it client side
        // For this task scope (UI Compact), we focus on the UI switch mostly.

        return {
            labels,
            datasets: [
                {
                    label: "Current",
                    data: currentValues,
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                    borderRadius: 4,
                    borderWidth: 0,
                },
                {
                    label: "Previous",
                    data: prevValues,
                    backgroundColor: "rgba(148, 163, 184, 0.5)",
                    borderRadius: 4,
                    borderWidth: 0,
                },
            ],
        };
    });

    // Use an effect to handle chart creation/updates when canvas and data are ready
    $effect(() => {
        if (!canvas) {
            return;
        }

        // Destroy existing instance if it exists
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }

        const ctx = canvas.getContext("2d");
        if (ctx && chartData) {
            try {
                chartInstance = new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels: chartData.labels,
                        datasets: chartData.datasets.map((ds, i) => {
                            // Create gradient
                            const gradient = ctx.createLinearGradient(
                                0,
                                0,
                                0,
                                400,
                            );
                            if (i === 0) {
                                // Current
                                gradient.addColorStop(
                                    0,
                                    "rgba(99, 102, 241, 0.9)",
                                ); // Indigo-500
                                gradient.addColorStop(
                                    1,
                                    "rgba(99, 102, 241, 0.4)",
                                );
                            } else {
                                // Previous
                                gradient.addColorStop(
                                    0,
                                    "rgba(148, 163, 184, 0.5)",
                                ); // Slate-400
                                gradient.addColorStop(
                                    1,
                                    "rgba(148, 163, 184, 0.1)",
                                );
                            }

                            return {
                                ...ds,
                                backgroundColor: gradient,
                                borderRadius: 6,
                                borderSkipped: false,
                                barThickness: mode === "week" ? 32 : "flex",
                                maxBarThickness: 40,
                            };
                        }),
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            mode: "index",
                            intersect: false,
                        },
                        plugins: {
                            legend: {
                                position: "top",
                                align: "end",
                                labels: {
                                    usePointStyle: true,
                                    pointStyle: "circle",
                                    boxWidth: 8,
                                    padding: 20,
                                    font: { family: "Inter", size: 11 },
                                },
                            },
                            tooltip: {
                                backgroundColor: "rgba(15, 23, 42, 0.9)",
                                titleFont: {
                                    family: "Inter",
                                    size: 13,
                                    weight: "600",
                                },
                                bodyFont: { family: "Inter", size: 12 },
                                padding: 10,
                                cornerRadius: 8,
                                displayColors: false,
                                callbacks: {
                                    label: (context) => {
                                        let label = context.dataset.label || "";
                                        if (label) {
                                            label += ": ";
                                        }
                                        if (context.parsed.y !== null) {
                                            const hours = Math.floor(
                                                context.parsed.y,
                                            );
                                            const minutes = Math.round(
                                                (context.parsed.y - hours) * 60,
                                            );
                                            label += `${hours}h ${minutes}m`;
                                        }
                                        return label;
                                    },
                                },
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                border: { display: false },
                                grid: {
                                    color: "rgba(148, 163, 184, 0.1)",
                                },
                                ticks: {
                                    font: { family: "Inter", size: 10 },
                                    color: "rgba(148, 163, 184, 0.8)",
                                    callback: (val) => val + "h",
                                },
                            },
                            x: {
                                border: { display: false },
                                grid: { display: false },
                                ticks: {
                                    font: {
                                        family: "Inter",
                                        size: 11,
                                        weight: "500",
                                    },
                                    color: "rgba(148, 163, 184, 0.8)",
                                },
                            },
                        },
                    },
                });
            } catch (error) {
                console.error("ReportChart: Error creating chart", error);
            }
        }
        return () => {
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = null;
            }
        };
    });

    onDestroy(() => {
        if (chartInstance) {
            chartInstance.destroy();
        }
    });

    // Derived state for visibility
    let hasData = $derived(
        $currentWeekData.entries.length > 0 ||
            $previousWeekData.entries.length > 0,
    );
</script>

<Card class="h-full shadow-md border-none flex flex-col">
    <CardHeader class="pb-4">
        <div class="flex items-start justify-between w-full">
            <div class="flex flex-col items-start gap-2">
                <CardTitle class="text-sm font-medium text-muted-foreground"
                    >Work Activity</CardTitle
                >
                <div
                    class="flex items-center gap-1 bg-background/50 rounded-lg p-0.5 border shadow-sm"
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onclick={handlePrev}
                        class="h-6 w-6"
                    >
                        <ChevronLeft class="h-3.5 w-3.5" />
                    </Button>
                    <div
                        class="flex items-center gap-2 px-2 min-w-[140px] justify-center font-medium font-mono text-xs"
                    >
                        <Calendar class="h-3 w-3 text-muted-foreground" />
                        <span>{formattedRange}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onclick={handleNext}
                        class="h-6 w-6"
                    >
                        <ChevronRight class="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    {#snippet child({ props })}
                        <Button
                            variant="outline"
                            size="sm"
                            class="h-7 text-xs gap-1"
                            {...props}
                        >
                            <span class="capitalize">{mode} View</span>
                            <ChevronDown class="h-3 w-3 opacity-50" />
                        </Button>
                    {/snippet}
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                    <DropdownMenu.Item onclick={() => setMode("week")}
                        >Week View</DropdownMenu.Item
                    >
                    <DropdownMenu.Item onclick={() => setMode("month")}
                        >Month View</DropdownMenu.Item
                    >
                    <DropdownMenu.Item onclick={() => setMode("year")}
                        >Year View</DropdownMenu.Item
                    >
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </div></CardHeader
    >
    <CardContent class="h-[300px] relative flex-1 min-h-0">
        <div class="w-full h-full {hasData ? 'block' : 'hidden'}">
            <canvas bind:this={canvas} class="w-full h-full"></canvas>
        </div>

        <div
            class="w-full h-full flex items-center justify-center text-muted-foreground flex-col gap-2 {hasData
                ? 'hidden'
                : 'flex'}"
        >
            <div class="p-4 rounded-full bg-secondary/50">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-bar-chart-2 opacity-50"
                    ><line x1="18" x2="18" y1="20" y2="10" /><line
                        x1="12"
                        x2="12"
                        y1="20"
                        y2="4"
                    /><line x1="6" x2="6" y1="20" y2="14" /></svg
                >
            </div>
            <span>No activity data to display</span>
        </div>
    </CardContent>
</Card>

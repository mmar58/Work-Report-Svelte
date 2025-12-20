<script lang="ts">
    import {
        currentWeekData,
        previousWeekData,
        viewMode,
    } from "$lib/stores/workData";
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
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

    // Prepare data for chart
    let chartData = $derived.by(() => {
        const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        // Logic placeholder matching the previous implementation
        const currentValues = [0, 0, 0, 0, 0, 0, 0];
        const prevValues = [0, 0, 0, 0, 0, 0, 0];

        $currentWeekData.entries.forEach((e) => {
            const day = new Date(e.date).getDay();
            const index = day === 0 ? 6 : day - 1; // Mon=0, Sun=6
            currentValues[index] += e.duration / 60;
        });

        $previousWeekData.entries.forEach((e) => {
            const day = new Date(e.date).getDay();
            const index = day === 0 ? 6 : day - 1;
            prevValues[index] += e.duration / 60;
        });

        return {
            labels,
            datasets: [
                {
                    label: "Current " + (mode === "week" ? "Week" : "Period"),
                    data: currentValues,
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                    borderRadius: 4,
                    borderWidth: 0,
                },
                {
                    label: "Previous " + (mode === "week" ? "Week" : "Period"),
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
        if (!canvas) return;

        // Destroy existing instance if it exists to prevent memory leaks/duplicates
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }

        const ctx = canvas.getContext("2d");
        if (ctx && chartData) {
            chartInstance = new Chart(ctx, {
                type: "bar",
                data: chartData,
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
                            labels: {
                                usePointStyle: true,
                            },
                        },
                        tooltip: {
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
                            title: {
                                display: true,
                                text: "Hours",
                            },
                        },
                        x: {
                            grid: {
                                display: false,
                            },
                        },
                    },
                },
            });
        }

        return () => {
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = null;
            }
        };
    });

    // Remove onMount logic since we use $effect now which is reactive to canvas binding

    onDestroy(() => {
        if (chartInstance) {
            chartInstance.destroy();
        }
    });
</script>

<Card class="h-full shadow-md border-none">
    <CardHeader class="pb-2">
        <CardTitle class="text-lg">Work Activity</CardTitle>
    </CardHeader>
    <CardContent class="h-[300px] relative">
        {#if $currentWeekData.entries.length > 0 || $previousWeekData.entries.length > 0}
            <canvas bind:this={canvas}></canvas>
        {:else}
            <div
                class="h-full flex items-center justify-center text-muted-foreground flex-col gap-2"
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
        {/if}
    </CardContent>
</Card>

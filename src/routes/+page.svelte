<script lang="ts">
    import Header from "$lib/components/Header.svelte";

    import TimeReport from "$lib/components/TimeReport.svelte";
    import FloatingReport from "$lib/components/FloatingReport.svelte";
    import WorkGoalTracker from "$lib/components/WorkGoalTracker.svelte";
    import ReportChart from "$lib/components/ReportChart.svelte";
    import DailyLogs from "$lib/components/DailyLogs.svelte";
    import * as Resizable from "$lib/components/ui/resizable";
    import { loadWorkData, dateRange } from "$lib/stores/workData";
    import {
        syncHourlyRateFromAPI,
        syncTargetHoursFromAPI,
        fetchCurrencyRate,
    } from "$lib/stores/settings";
    import { onMount } from "svelte";

    // Force HMR refresh
    onMount(async () => {
        // Initial data load
        await Promise.all([
            loadWorkData(),
            syncHourlyRateFromAPI(),
            syncTargetHoursFromAPI(),
            fetchCurrencyRate(),
        ]);
    });
</script>

<div class="flex flex-col min-h-screen">
    <Header />

    <main class="flex-1 container py-6 space-y-4">
        <!-- Desktop Layout (Resizable) -->
        <div
            class="hidden lg:block h-[calc(100vh-140px)] min-h-[600px] border rounded-xl overflow-hidden shadow-sm bg-background/40 backdrop-blur-md"
        >
            <Resizable.PaneGroup direction="horizontal">
                <!-- Left Panel: Reports & Controls -->
                <Resizable.Pane defaultSize={20} minSize={15} maxSize={25}>
                    <div
                        class="h-full flex flex-col p-3 gap-3 overflow-y-auto border-r border-border/30"
                    >
                        <div class="flex-none">
                            <TimeReport />
                        </div>
                        <div class="flex-1 min-h-[150px]">
                            <FloatingReport />
                        </div>
                    </div>
                </Resizable.Pane>

                <Resizable.Handle withHandle />

                <!-- Middle Panel: Main Chart -->
                <Resizable.Pane defaultSize={50} minSize={40}>
                    <div class="h-full p-3">
                        <ReportChart />
                    </div>
                </Resizable.Pane>

                <Resizable.Handle withHandle />

                <!-- Right Panel: Goals & Logs -->
                <Resizable.Pane defaultSize={30} minSize={25} maxSize={40}>
                    <div
                        class="h-full flex flex-col p-3 gap-3 overflow-y-auto border-l border-border/30"
                    >
                        <div class="flex-none">
                            <WorkGoalTracker />
                        </div>
                        <div class="flex-1 pt-2 overflow-hidden">
                            <DailyLogs />
                        </div>
                    </div>
                </Resizable.Pane>
            </Resizable.PaneGroup>
        </div>

        <!-- Mobile Layout (Stacked) -->
        <div class="lg:hidden flex flex-col gap-6">
            <TimeReport />
            <ReportChart />
            <WorkGoalTracker />
            <FloatingReport />
        </div>
    </main>
</div>

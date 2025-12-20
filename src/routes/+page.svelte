<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Controls from "$lib/components/Controls.svelte";
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

    <main class="flex-1 container py-6 space-y-6">
        <Controls />

        <!-- Desktop Layout (Resizable) -->
        <div
            class="hidden lg:block h-[calc(100vh-200px)] min-h-[600px] border rounded-xl overflow-hidden shadow-sm bg-background/40 backdrop-blur-md"
        >
            <Resizable.PaneGroup direction="horizontal">
                <!-- Left Panel: Reports & Controls -->
                <Resizable.Pane defaultSize={25} minSize={20} maxSize={35}>
                    <div class="h-full flex flex-col p-4 gap-4 overflow-y-auto">
                        <div class="flex-none">
                            <TimeReport />
                        </div>
                        <div class="flex-1 min-h-[200px]">
                            <FloatingReport />
                        </div>
                    </div>
                </Resizable.Pane>

                <Resizable.Handle withHandle />

                <!-- Middle Panel: Main Chart -->
                <Resizable.Pane defaultSize={50} minSize={30}>
                    <div class="h-full p-4">
                        <ReportChart />
                    </div>
                </Resizable.Pane>

                <Resizable.Handle withHandle />

                <!-- Right Panel: Goals & Logs -->
                <Resizable.Pane defaultSize={25} minSize={20} maxSize={35}>
                    <div class="h-full flex flex-col p-4 gap-4 overflow-y-auto">
                        <div class="flex-none">
                            <WorkGoalTracker />
                        </div>
                        <div class="flex-1 border-t pt-4 overflow-hidden">
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

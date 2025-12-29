<script lang="ts">
    import {
        currentWeekData,
        previousWeekData,
        viewMode,
    } from "$lib/stores/workData";
    import { settings } from "$lib/stores/settings";
    import {
        format,
        startOfWeek,
        endOfWeek,
        parseISO,
        startOfMonth,
        endOfMonth,
        isSameWeek,
        isSameMonth,
        subWeeks,
        subMonths,
        subYears,
    } from "date-fns";
    import {
        Accordion,
        AccordionContent,
        AccordionItem,
        AccordionTrigger,
    } from "$lib/components/ui/accordion";
    import { Separator } from "$lib/components/ui/separator";

    let mode = $derived($viewMode);

    // Filter out future days
    let todayStr = format(new Date(), "yyyy-MM-dd");

    // Combine current and previous entries
    let currentEntries = $derived($currentWeekData.entries);
    let prevEntries = $derived($previousWeekData.entries);

    let entries = $derived(
        [...currentEntries, ...prevEntries]
            .filter((e) => e.date <= todayStr)
            .sort((a, b) => b.date.localeCompare(a.date)), // Ensure strict descending sort
    );

    // Helper to format duration
    function formatDuration(minutes: number) {
        const h = Math.floor(minutes / 60);
        const m = Math.floor(minutes % 60);
        return `${h}h ${m}m`;
    }

    function formatSessionDuration(durationStr: string) {
        // durationStr is usually HH:MM:SS or similar from backend
        // Use simple string if it's already formatted, or parse if needed.
        // Backend says "HH:MM:SS".
        if (!durationStr) return "0h 0m";
        const parts = durationStr.split(":");
        if (parts.length >= 2) {
            const h = parseInt(parts[0]);
            const m = parseInt(parts[1]);
            return `${h}h ${m}m`;
        }
        return durationStr;
    }

    // logic for comparison removed as we are showing full logs now

    // Grouper function
    function groupEntries(entries: any[], mode: "week" | "month" | "year") {
        // Sort inputs descending first
        const sortedEntries = [...entries].sort((a, b) =>
            b.date.localeCompare(a.date),
        );

        if (mode === "week") return { type: "flat", data: sortedEntries };

        if (mode === "month") {
            // Group by Week
            const groups: Record<string, any[]> = {};
            sortedEntries.forEach((e) => {
                const date = parseISO(e.date);
                const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
                const key = format(weekStart, "yyyy-MM-dd");
                if (!groups[key]) groups[key] = [];
                groups[key].push(e);
            });
            return {
                type: "grouped",
                labelFormat: (key: string) =>
                    `Week of ${format(parseISO(key), "MMM d, yyyy")}`,
                data: Object.entries(groups).sort((a, b) =>
                    b[0].localeCompare(a[0]),
                ),
            };
        }

        if (mode === "year") {
            // Group by Month
            const groups: Record<string, any[]> = {};
            sortedEntries.forEach((e) => {
                const date = parseISO(e.date);
                const monthStart = startOfMonth(date);
                const key = format(monthStart, "yyyy-MM-dd");
                if (!groups[key]) groups[key] = [];
                groups[key].push(e);
            });
            return {
                type: "grouped",
                labelFormat: (key: string) =>
                    format(parseISO(key), "MMMM yyyy"),
                data: Object.entries(groups).sort((a, b) =>
                    b[0].localeCompare(a[0]),
                ),
            };
        }

        return { type: "flat", data: sortedEntries };
    }

    let groupedData = $derived(groupEntries(entries, mode));
</script>

<div class="h-full flex flex-col">
    <h3 class="font-medium mb-4 flex items-center justify-between">
        Daily Logs
        <span class="text-xs text-muted-foreground font-normal">
            {entries.length} days logged
        </span>
    </h3>

    <div class="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
        {#if entries.length === 0}
            <div
                class="text-sm text-muted-foreground italic opacity-50 text-center py-8"
            >
                No logs for this period
            </div>
        {:else if groupedData.type === "flat"}
            <!-- Week View: Flat List -->
            <div class="space-y-6">
                {#each groupedData.data as entry}
                    <div class="space-y-2">
                        <!-- Date Header -->
                        <div
                            class="flex items-baseline justify-between sticky top-0 bg-background/95 backdrop-blur py-2 z-10 border-b"
                        >
                            <h4 class="font-medium text-sm">
                                {format(parseISO(entry.date), "EEE, MMM d")}
                            </h4>
                            <div class="flex flex-col items-end">
                                <span
                                    class="text-xs font-mono font-medium text-primary"
                                >
                                    {formatDuration(
                                        entry.duration +
                                            (entry.extraminutes || 0),
                                    )}
                                </span>
                                {#if entry.extraminutes > 0}
                                    <span
                                        class="text-[10px] text-green-500 font-mono"
                                    >
                                        (+{formatDuration(entry.extraminutes)} extra)
                                    </span>
                                {/if}
                                {#if $settings.targetHours > 0}
                                    {@const totalDaily =
                                        entry.duration +
                                        (entry.extraminutes || 0)}
                                    {@const dailyTarget =
                                        ($settings.targetHours * 60) / 7}
                                    {@const diff = totalDaily - dailyTarget}
                                    {#if Math.abs(diff) > 1}
                                        <!-- Ignore negligible diffs -->
                                        <span
                                            class="text-[10px] font-mono {diff >
                                            0
                                                ? 'text-green-500'
                                                : 'text-red-500'}"
                                        >
                                            {diff > 0
                                                ? "+"
                                                : "-"}{formatDuration(
                                                Math.abs(diff),
                                            )}
                                        </span>
                                    {/if}
                                {/if}
                            </div>
                        </div>

                        <!-- Detailed Sessions -->
                        {#if entry.detailedWork && entry.detailedWork.length > 0}
                            <div class="space-y-1 pl-2 border-l-2 ml-1">
                                {#each entry.detailedWork as session}
                                    <div
                                        class="flex justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <span>
                                            {session.startTime.slice(0, 5)} - {session.endTime.slice(
                                                0,
                                                5,
                                            )}
                                        </span>
                                        <span class="font-mono">
                                            {formatSessionDuration(
                                                session.duration,
                                            )}
                                        </span>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <div
                                class="text-xs text-muted-foreground italic pl-3"
                            >
                                No detailed sessions
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {:else}
            <!-- Month/Year View: Grouped Accordion -->
            <Accordion type="multiple" class="w-full">
                {#each groupedData.data as [key, groupEntries]}
                    <AccordionItem value={key}>
                        <AccordionTrigger class="hover:no-underline py-3">
                            <div
                                class="flex flex-1 items-center justify-between mr-2"
                            >
                                <span class="text-sm font-medium"
                                    >{groupedData.labelFormat(key)}</span
                                >
                                <span
                                    class="text-xs text-muted-foreground font-mono"
                                >
                                    {formatDuration(
                                        groupEntries.reduce(
                                            (acc: number, e: any) =>
                                                acc +
                                                e.duration +
                                                (e.extraminutes || 0),
                                            0,
                                        ),
                                    )}
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div class="space-y-6 pt-2 pb-4 pl-1">
                                {#each groupEntries as entry}
                                    <div class="space-y-2">
                                        <div
                                            class="flex items-baseline justify-between"
                                        >
                                            <h5
                                                class="text-xs font-medium text-muted-foreground"
                                            >
                                                {format(
                                                    parseISO(entry.date),
                                                    "EEE, MMM d",
                                                )}
                                            </h5>
                                            <div
                                                class="flex flex-col items-end"
                                            >
                                                <span
                                                    class="text-[10px] font-mono opacity-80"
                                                >
                                                    {formatDuration(
                                                        entry.duration +
                                                            (entry.extraminutes ||
                                                                0),
                                                    )}
                                                </span>
                                                {#if entry.extraminutes > 0}
                                                    <span
                                                        class="text-[10px] text-green-500 font-mono"
                                                    >
                                                        (+{formatDuration(
                                                            entry.extraminutes,
                                                        )} extra)
                                                    </span>
                                                {/if}
                                                {#if $settings.targetHours > 0}
                                                    {@const totalDaily =
                                                        entry.duration +
                                                        (entry.extraminutes ||
                                                            0)}
                                                    {@const dailyTarget =
                                                        ($settings.targetHours *
                                                            60) /
                                                        7}
                                                    {@const diff =
                                                        totalDaily -
                                                        dailyTarget}
                                                    {#if Math.abs(diff) > 1}
                                                        <span
                                                            class="text-[10px] font-mono {diff >
                                                            0
                                                                ? 'text-green-500'
                                                                : 'text-red-500'}"
                                                        >
                                                            {diff > 0
                                                                ? "+"
                                                                : "-"}{formatDuration(
                                                                Math.abs(diff),
                                                            )}
                                                        </span>
                                                    {/if}
                                                {/if}
                                            </div>
                                        </div>

                                        {#if entry.detailedWork && entry.detailedWork.length > 0}
                                            <div
                                                class="space-y-1 pl-2 border-l-2 ml-1 border-muted/50"
                                            >
                                                {#each entry.detailedWork as session}
                                                    <div
                                                        class="flex justify-between text-[10px] text-muted-foreground"
                                                    >
                                                        <span>
                                                            {session.startTime.slice(
                                                                0,
                                                                5,
                                                            )} - {session.endTime.slice(
                                                                0,
                                                                5,
                                                            )}
                                                        </span>
                                                        <span class="font-mono">
                                                            {formatSessionDuration(
                                                                session.duration,
                                                            )}
                                                        </span>
                                                    </div>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                {/each}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                {/each}
            </Accordion>
        {/if}
    </div>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: hsl(var(--muted-foreground) / 0.3);
        border-radius: 4px;
    }
</style>

<script lang="ts">
    import {
        settings,
        updateHourlyRate,
        updateTargetHours,
        theme,
    } from "$lib/stores/settings";
    import {
        viewMode,
        dateRange,
        loadWorkData,
        currentWeekData,
    } from "$lib/stores/workData"; // Import work stores
    import {
        Sun,
        Moon,
        Settings,
        ChevronLeft,
        ChevronRight,
        RotateCw,
        Calendar,
        Target,
        Zap,
        CalendarDays,
    } from "lucide-svelte"; // Add icons
    import { Button } from "$lib/components/ui/button";
    import * as Sheet from "$lib/components/ui/sheet";
    import * as Dialog from "$lib/components/ui/dialog";
    import ExtraTimeDialog from "$lib/components/ExtraTimeDialog.svelte";

    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Progress } from "$lib/components/ui/progress";
    import {
        calculateRemainingDays,
        calculateRequiredDaily,
    } from "$lib/utils/calculations";
    import {
        addWeeks,
        subWeeks,
        addMonths,
        subMonths,
        addYears,
        subYears,
        format,
        startOfMonth,
        endOfMonth,
        startOfYear,
        endOfYear,
    } from "date-fns";

    let showExtraTimeDialog = $state(false);

    function toggleTheme() {
        const newTheme = $theme === "light" ? "dark" : "light";
        theme.set(newTheme);
    }

    // NOTE: Theme application is now handled in +layout.svelte to ensure global persistence
    // But we keep the toggle logic here.

    let tempHourlyRate = $state($settings.hourlyRate);
    let tempTargetHours = $state($settings.targetHours);
    let isLoading = $state(false);

    $effect(() => {
        tempHourlyRate = $settings.hourlyRate;
        tempTargetHours = $settings.targetHours;
    });

    async function saveSettings() {
        await Promise.all([
            updateHourlyRate(Number(tempHourlyRate)),
            updateTargetHours(Number(tempTargetHours)),
        ]);
    }

    // Goal Logic
    let weeklyHours = $derived(
        Number($currentWeekData.totalHours) +
            Number($currentWeekData.totalMinutes) / 60,
    );
    let targetHours = $derived($settings.targetHours);
    let percentage = $derived(Math.min(100, (weeklyHours / targetHours) * 100));

    let remainingDays = $derived(calculateRemainingDays());
    let currentTotalMinutes = $derived(
        $currentWeekData.totalHours * 60 + $currentWeekData.totalMinutes,
    );
    let requiredDaily = $derived(
        calculateRequiredDaily(currentTotalMinutes, targetHours, remainingDays),
    );

    // Navigation Logic
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

    async function handleRefresh() {
        isLoading = true;
        await loadWorkData();
        isLoading = false;
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

<header
    class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 transition-all"
>
    <div class="container flex h-14 items-center justify-between">
        <div class="flex items-center gap-4 min-w-[300px]">
            <!-- Brand -->
            <div class="flex items-center gap-3">
                <div
                    class="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner"
                >
                    <span class="font-black text-xs tracking-tighter">WR</span>
                </div>
                <span
                    class="font-bold text-lg tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent hidden sm:inline-block"
                    >WorkReport</span
                >
            </div>

            <!-- Compact Date Navigator -->
            <Button
                variant="outline"
                size="sm"
                class="ml-2 h-7 text-xs gap-1 hidden md:flex"
                onclick={() => (showExtraTimeDialog = true)}
            >
                <CalendarDays class="h-3 w-3" />
                <span>Add Extra</span>
            </Button>

            <Dialog.Root bind:open={showExtraTimeDialog}>
                <ExtraTimeDialog bind:open={showExtraTimeDialog} />
            </Dialog.Root>
        </div>

        <!-- CENTER: Weekly Goal Widget -->
        <div
            class="hidden lg:flex flex-col items-center justify-center gap-1 w-[320px]"
        >
            <div
                class="flex items-center justify-between w-full text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-1"
            >
                <span class="flex items-center gap-1"
                    ><Target class="h-3 w-3" /> Weekly Goal</span
                >
                <span>{percentage.toFixed(0)}%</span>
            </div>
            <Progress value={percentage} class="h-1.5 w-full bg-secondary" />
            <div
                class="flex items-center justify-between w-full text-[10px] font-mono text-muted-foreground px-1 opacity-80"
            >
                <span class="flex items-center gap-1"
                    ><CalendarDays class="h-2.5 w-2.5" />
                    {remainingDays}d Left</span
                >
                <span>{weeklyHours.toFixed(1)} / {targetHours}h</span>
                <span class="flex items-center gap-1"
                    ><Zap class="h-2.5 w-2.5 text-amber-500" /> Target {requiredDaily.hours}h
                    {requiredDaily.minutes}m</span
                >
            </div>
        </div>

        <div class="flex items-center gap-1 justify-end min-w-[300px]">
            <!-- Refresh Button -->
            <Button
                variant="ghost"
                size="icon"
                onclick={handleRefresh}
                disabled={isLoading}
                class="rounded-lg text-muted-foreground hover:text-foreground"
            >
                <RotateCw
                    class="h-[1.1rem] w-[1.1rem] {isLoading
                        ? 'animate-spin'
                        : ''}"
                />
            </Button>

            <!-- Theme Toggle -->
            <Button
                variant="ghost"
                size="icon"
                onclick={toggleTheme}
                aria-label="Toggle theme"
                class="rounded-lg text-muted-foreground hover:text-foreground"
            >
                <Sun
                    class="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                />
                <Moon
                    class="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                />
            </Button>

            <!-- Settings Sheet -->
            <Sheet.Root>
                <Sheet.Trigger>
                    {#snippet child({ props })}
                        <Button
                            variant="ghost"
                            size="icon"
                            {...props}
                            class="rounded-lg text-muted-foreground hover:text-foreground"
                        >
                            <Settings class="h-[1.1rem] w-[1.1rem]" />
                        </Button>
                    {/snippet}
                </Sheet.Trigger>
                <Sheet.Content
                    class="border-l border-border/40 bg-background/80 backdrop-blur-2xl"
                >
                    <Sheet.Header>
                        <Sheet.Title class="text-left">Settings</Sheet.Title>
                        <Sheet.Description class="text-left">
                            Configure your work preferences.
                        </Sheet.Description>
                    </Sheet.Header>

                    <div class="grid gap-6 py-6">
                        <div class="space-y-3">
                            <Label
                                for="hourly-rate"
                                class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                                >Hourly Rate ($)</Label
                            >
                            <Input
                                id="hourly-rate"
                                type="number"
                                bind:value={tempHourlyRate}
                                class="bg-secondary/50 border-transparent shadow-none"
                            />
                        </div>
                        <div class="space-y-3">
                            <Label
                                for="target-hours"
                                class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                                >Weekly Target (Hours)</Label
                            >
                            <Input
                                id="target-hours"
                                type="number"
                                bind:value={tempTargetHours}
                                class="bg-secondary/50 border-transparent shadow-none"
                            />
                        </div>
                    </div>

                    <Sheet.Footer>
                        <Sheet.Close>
                            {#snippet child({ props })}
                                <Button
                                    type="submit"
                                    onclick={saveSettings}
                                    {...props}
                                    class="w-full">Save Changes</Button
                                >
                            {/snippet}
                        </Sheet.Close>
                    </Sheet.Footer>
                </Sheet.Content>
            </Sheet.Root>
        </div>
    </div>
</header>

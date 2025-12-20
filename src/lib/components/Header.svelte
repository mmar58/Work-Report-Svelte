<script lang="ts">
    import {
        settings,
        updateHourlyRate,
        updateTargetHours,
    } from "$lib/stores/settings";
    import { Sun, Moon, Settings, Monitor } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import * as Sheet from "$lib/components/ui/sheet";

    let theme = "dark"; // Default or from store if we had one

    function toggleTheme() {
        // Simplified theme toggle for now
        if (document.documentElement.classList.contains("dark")) {
            document.documentElement.classList.remove("dark");
            theme = "light";
        } else {
            document.documentElement.classList.add("dark");
            theme = "dark";
        }
    }

    let tempHourlyRate = $state($settings.hourlyRate);
    let tempTargetHours = $state($settings.targetHours);

    // Sync state with store updates
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
</script>

<header
    class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 transition-all"
>
    <div class="container flex h-14 items-center justify-between">
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

        <div class="flex items-center gap-1">
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

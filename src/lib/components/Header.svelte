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
    class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
    <div class="container flex h-14 items-center justify-between">
        <div class="flex items-center gap-2">
            <div
                class="h-6 w-6 rounded-md bg-primary flex items-center justify-center"
            >
                <span class="text-primary-foreground font-bold text-xs">WR</span
                >
            </div>
            <span class="font-bold hidden sm:inline-block">WorkReport</span>
        </div>

        <div class="flex items-center gap-2">
            <!-- Theme Toggle -->
            <Button
                variant="ghost"
                size="icon"
                onclick={toggleTheme}
                aria-label="Toggle theme"
            >
                <Sun
                    class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                />
                <Moon
                    class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                />
            </Button>

            <!-- Settings Sheet -->
            <Sheet.Root>
                <Sheet.Trigger>
                    {#snippet child({ props })}
                        <Button variant="ghost" size="icon" {...props}>
                            <Settings class="h-[1.2rem] w-[1.2rem]" />
                        </Button>
                    {/snippet}
                </Sheet.Trigger>
                <Sheet.Content>
                    <Sheet.Header>
                        <Sheet.Title>Settings</Sheet.Title>
                        <Sheet.Description>
                            Configure your work preferences and rates.
                        </Sheet.Description>
                    </Sheet.Header>

                    <div class="grid gap-4 py-4">
                        <div class="grid gap-2">
                            <Label for="hourly-rate">Hourly Rate ($)</Label>
                            <Input
                                id="hourly-rate"
                                type="number"
                                bind:value={tempHourlyRate}
                            />
                        </div>
                        <div class="grid gap-2">
                            <Label for="target-hours"
                                >Weekly Target (Hours)</Label
                            >
                            <Input
                                id="target-hours"
                                type="number"
                                bind:value={tempTargetHours}
                            />
                        </div>
                    </div>

                    <Sheet.Footer>
                        <Sheet.Close>
                            {#snippet child({ props })}
                                <Button
                                    type="submit"
                                    onclick={saveSettings}
                                    {...props}>Save changes</Button
                                >
                            {/snippet}
                        </Sheet.Close>
                    </Sheet.Footer>
                </Sheet.Content>
            </Sheet.Root>
        </div>
    </div>
</header>

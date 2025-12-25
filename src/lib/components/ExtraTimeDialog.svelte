<script lang="ts">
    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Calendar } from "$lib/components/ui/calendar";
    import {
        type DateValue,
        getLocalTimeZone,
        today,
    } from "@internationalized/date";
    import { Loader2 } from "lucide-svelte";
    import { toast } from "svelte-sonner";
    import { loadWorkData } from "$lib/stores/workData";
    import { format } from "date-fns";
    import { config } from "$lib/config";

    let { open = $bindable(false) } = $props();

    let value = $state<DateValue>(today(getLocalTimeZone()));
    let hours = $state(0);
    let minutes = $state(0);
    let isLoading = $state(false);
    let isFetching = $state(false);

    // Fetch existing extra minutes when date changes
    async function fetchExtraTime(dateStr: string) {
        isFetching = true;
        try {
            // Re-using general work data fetch might get heavy if we just want one day,
            // but for now let's query the specific endpoint if we had one, or filter from existing data store?
            // Better to fetch fresh from backend to ensure accuracy.
            // Using the existing /work-data endpoint which returns array
            const res = await fetch(
                `${config.api.baseUrl}/work-data?startDate=${dateStr}&endDate=${dateStr}`,
            );
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    // Assuming backend returns extraminutes in the row
                    const extra = data[0].extraminutes || 0;
                    hours = Math.floor(extra / 60);
                    minutes = extra % 60;
                } else {
                    hours = 0;
                    minutes = 0;
                }
            }
        } catch (error) {
            console.error("Failed to fetch extra time", error);
        } finally {
            isFetching = false;
        }
    }

    // Watch for date changes to fetch data
    $effect(() => {
        if (open && value) {
            const dateStr = value.toString();
            fetchExtraTime(dateStr);
        }
    });

    async function handleSave() {
        if (!value) return;
        isLoading = true;

        const totalMinutes = Number(hours) * 60 + Number(minutes);
        const dateStr = value.toString();

        try {
            const res = await fetch(
                `${config.api.baseUrl}/update-extra-minutes`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        date: dateStr,
                        minutes: totalMinutes,
                    }),
                },
            );

            if (!res.ok) throw new Error("Failed to update");

            toast.success("Extra time updated successfully");
            await loadWorkData(); // Refresh global data
            open = false;
        } catch (error) {
            console.error(error);
            toast.error("Failed to save extra time");
        } finally {
            isLoading = false;
        }
    }
</script>

<Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
        <Dialog.Title>Add Extra Time</Dialog.Title>
        <Dialog.Description>
            Manually add extra work minutes for a specific date.
        </Dialog.Description>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
        <div class="flex flex-col gap-2 items-center justify-center">
            <Calendar bind:value type="single" class="rounded-md border" />
        </div>

        {#if isFetching}
            <div class="flex justify-center py-4">
                <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        {:else}
            <div class="grid grid-cols-2 gap-4">
                <div class="grid gap-2">
                    <Label for="hours">Hours</Label>
                    <Input
                        id="hours"
                        type="number"
                        min="0"
                        bind:value={hours}
                    />
                </div>
                <div class="grid gap-2">
                    <Label for="minutes">Minutes</Label>
                    <Input
                        id="minutes"
                        type="number"
                        min="0"
                        max="59"
                        bind:value={minutes}
                    />
                </div>
            </div>
        {/if}
    </div>
    <Dialog.Footer>
        <Button
            type="submit"
            onclick={handleSave}
            disabled={isLoading || isFetching}
        >
            {#if isLoading}
                <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            {/if}
            Save Changes
        </Button>
    </Dialog.Footer>
</Dialog.Content>

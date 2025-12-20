<script lang="ts">
    import {
        settings,
        shortDescription,
        dollarRate,
    } from "$lib/stores/settings";
    import { currentWeekData, dateRange } from "$lib/stores/workData"; // Import work data
    import { Input } from "$lib/components/ui/input";
    import { Card, CardContent } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { format } from "date-fns";
    import { calculateEarnings } from "$lib/utils/calculations";
    import { formatMoney } from "$lib/utils/formatters";

    let tempDescription = $state($shortDescription);
    let isCopied = $state(false);

    $effect(() => {
        tempDescription = $shortDescription;
    });

    function updateDescription() {
        shortDescription.set(tempDescription);
    }

    // Derived values for the report
    let formattedDateRange = $derived.by(() => {
        if (!$dateRange.startDate || !$dateRange.endDate) return "";
        const start = $dateRange.startDate;
        const end = $dateRange.endDate;
        // MM.DD.YY format
        return `${start.getMonth() + 1}.${start.getDate()}.${start.getFullYear().toString().slice(-2)} - ${end.getMonth() + 1}.${end.getDate()}.${end.getFullYear().toString().slice(-2)}`;
    });

    let totalHours = $derived($currentWeekData.totalHours);
    let totalMinutes = $derived($currentWeekData.totalMinutes);

    // Earnings Calculation matches TimeReport logic
    let earningsUSD = $derived(
        calculateEarnings(totalHours, totalMinutes, $settings.hourlyRate),
    );
    let earningsBDT = $derived(earningsUSD * $settings.dollarRate);

    let reportRef: HTMLElement;

    function handleCopy() {
        if (reportRef) {
            const text = reportRef.innerText;
            navigator.clipboard.writeText(text);
            isCopied = true;
            setTimeout(() => {
                isCopied = false;
            }, 1000);
        }
    }
</script>

<div class="relative h-full flex flex-col justify-between">
    {#if isCopied}
        <div
            class="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-all text-xs font-bold"
        >
            Copied to clipboard!
        </div>
    {/if}

    <Card
        class="w-full h-full shadow-lg border-primary/10 bg-card/50 backdrop-blur-sm flex flex-col"
    >
        <div
            class="p-4 border-b border-border/30 flex items-center justify-between"
        >
            <Input
                value={`Dollar R - ${$settings.dollarRate}`}
                readonly
                class="font-mono text-sm bg-muted/50 border-transparent w-[160px] h-9"
            />
            <Button
                variant="outline"
                size="sm"
                class="h-9 text-sm bg-muted/50 hover:bg-muted"
                onclick={handleCopy}
            >
                {isCopied ? "Copied" : "Copy"}
            </Button>
        </div>

        <CardContent class="p-4 space-y-4 flex-1 overflow-y-auto">
            <Input
                bind:value={tempDescription}
                oninput={updateDescription}
                placeholder="Enter short description"
                class="h-9 text-sm bg-transparent border-border/40 focus-visible:ring-1"
            />

            <!-- Report Text Area - Target for Copy -->
            <div
                bind:this={reportRef}
                class="space-y-2 text-sm text-muted-foreground select-text font-mono bg-background/30 p-3 rounded-md border border-border/20"
            >
                <p>
                    <strong class="text-foreground">Date Range:</strong>
                    {formattedDateRange}
                </p>
                <p>
                    <strong class="text-foreground">Short Desc:</strong>
                    {tempDescription || "N/A"}
                </p>
                <p>
                    <strong class="text-foreground">Total:</strong>
                    {totalHours} hours {totalMinutes} minutes
                </p>
                <p>
                    <strong class="text-foreground">BDT:</strong>
                    {formatMoney(earningsBDT, "BDT")}
                </p>
                <p>
                    <strong class="text-foreground">USD (from Google):</strong>
                    {formatMoney(earningsUSD)}
                </p>
            </div>
        </CardContent>
    </Card>
</div>

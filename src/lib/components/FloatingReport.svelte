<script lang="ts">
    import {
        settings,
        shortDescription,
        dollarRate,
        fetchCurrencyRate,
    } from "$lib/stores/settings";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { RefreshCw } from "lucide-svelte";

    let tempDescription = $state($shortDescription);
    let tempDollarRate = $state($dollarRate);
    let isRefreshingRate = $state(false);

    $effect(() => {
        tempDescription = $shortDescription;
        tempDollarRate = $dollarRate;
    });

    function updateDescription() {
        shortDescription.set(tempDescription);
    }

    function updateRate() {
        dollarRate.set(Number(tempDollarRate));
    }

    async function refreshCurrency() {
        isRefreshingRate = true;
        const rate = await fetchCurrencyRate();
        if (rate) {
            tempDollarRate = rate;
        }
        isRefreshingRate = false;
    }
</script>

<Card
    class="w-full h-full shadow-lg border-primary/10 bg-card/50 backdrop-blur-sm"
>
    <CardHeader class="pb-2">
        <CardTitle class="text-lg font-medium text-muted-foreground"
            >Control Panel</CardTitle
        >
    </CardHeader>
    <CardContent class="grid gap-4">
        <div class="grid gap-2">
            <Label for="dollar-rate">Dollar Rate (BDT)</Label>
            <div class="flex gap-2">
                <Input
                    id="dollar-rate"
                    type="number"
                    bind:value={tempDollarRate}
                    oninput={updateRate}
                    class="font-mono text-lg"
                />
                <Button
                    variant="outline"
                    size="icon"
                    onclick={refreshCurrency}
                    disabled={isRefreshingRate}
                >
                    <RefreshCw
                        class="h-4 w-4 {isRefreshingRate ? 'animate-spin' : ''}"
                    />
                </Button>
            </div>
        </div>

        <div class="grid gap-2">
            <Label for="description">Short Description</Label>
            <Input
                id="description"
                bind:value={tempDescription}
                oninput={updateDescription}
                placeholder="e.g. Working on Project X"
            />
        </div>
    </CardContent>
</Card>

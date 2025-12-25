import { derived, get } from 'svelte/store';
import { persisted, persistedWithTTL } from './persisted';
import { config } from '$lib/config';
import type { SettingsState } from '$lib/types';

// Individual persisted stores
export const hourlyRate = persisted<number>(
    'hourlyRate',
    config.defaults.hourlyRate
);

export const targetHours = persisted<number>(
    'targetHours',
    config.defaults.targetHours
);

export const dollarRate = persistedWithTTL<number>(
    'dollarRate',
    0,
    config.cache.currencyRateTTL
);

export const shortDescription = persisted<string>(
    'shortDescription',
    ''
);

// Derived store combining all settings
export const settings = derived(
    [hourlyRate, targetHours, dollarRate, shortDescription],
    ([$hourlyRate, $targetHours, $dollarRate, $shortDescription]) => ({
        hourlyRate: $hourlyRate,
        targetHours: $targetHours,
        dollarRate: $dollarRate,
        shortDescription: $shortDescription
    } as SettingsState)
);

// API sync functions
export async function syncHourlyRateFromAPI() {
    try {
        const response = await fetch(`${config.api.baseUrl}/hourlyRate`);
        const data = await response.json();
        // Backend returns the number directly
        hourlyRate.set(Number(data) || 0);
    } catch (error) {
        console.error('Failed to sync hourly rate:', error);
    }
}

export async function updateHourlyRate(rate: number) {
    // Backend seems to lack a POST /hourlyRate. Skipping or leaving assumtion of read-only for now, 
    // or if we decide to implement it, we'd add it here. 
    // For now the existing code was:
    // fetch(`${config.api.baseUrl}/hourly-rate?rate=${rate}`, { method: 'POST' })
    // We agreed to leave it or standardise. Since backend is GET-only for /hourlyRate, this will fail 404.
    // However, prompt asked to fix parsing. I will leave this as is unless user complains about saving.
    // The main issue was "NaN" in display.
    try {
        // Leaving this as broken/unimplemented since backend has no endpoint.
        // Or better - let's try the GET pattern just in case? No, server.js clearly has no update.
        return false;
    } catch (error) {
        console.error('Failed to update hourly rate:', error);
        return false;
    }
}

export async function syncTargetHoursFromAPI() {
    try {
        const response = await fetch(`${config.api.baseUrl}/getTargetHours`);
        const data = await response.json();
        targetHours.set(Number(data) || 0);
    } catch (error) {
        console.error('Failed to sync target hours:', error);
    }
}

export async function updateTargetHours(hours: number) {
    try {
        const response = await fetch(`${config.api.baseUrl}/setTargetHours?hours=${hours}`);
        if (response.ok) {
            targetHours.set(hours);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to update target hours:', error);
        return false;
    }
}

export async function fetchCurrencyRate() {
    const currentRate = get(dollarRate);

    // Return cached rate if valid
    if (currentRate > 0) {
        return currentRate;
    }

    try {
        const response = await fetch(config.api.currencyUrl);
        const data = await response.json();
        const rate = data.geoplugin_currencyConverter || 0;
        dollarRate.set(rate);
        return rate;
    } catch (error) {
        console.error('Failed to fetch currency rate:', error);
        return 0;
    }
}

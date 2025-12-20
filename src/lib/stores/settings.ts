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
        const response = await fetch('/api/hourly-rate');
        const data = await response.json();
        hourlyRate.set(data.rate);
    } catch (error) {
        console.error('Failed to sync hourly rate:', error);
    }
}

export async function updateHourlyRate(rate: number) {
    try {
        const response = await fetch(`/api/hourly-rate?rate=${rate}`, {
            method: 'POST'
        });
        if (response.ok) {
            hourlyRate.set(rate);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to update hourly rate:', error);
        return false;
    }
}

export async function syncTargetHoursFromAPI() {
    try {
        const response = await fetch('/api/target-hours');
        const data = await response.json();
        targetHours.set(data.hours);
    } catch (error) {
        console.error('Failed to sync target hours:', error);
    }
}

export async function updateTargetHours(hours: number) {
    try {
        const response = await fetch(`/api/target-hours?hours=${hours}`, {
            method: 'POST'
        });
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
        const response = await fetch('/api/currency');
        const data = await response.json();
        const rate = data.geoplugin_currencyConverter || 0;
        dollarRate.set(rate);
        return rate;
    } catch (error) {
        console.error('Failed to fetch currency rate:', error);
        return 0;
    }
}

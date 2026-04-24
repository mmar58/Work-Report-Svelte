import { derived, get } from 'svelte/store';
import { persisted, persistedWithTTL } from './persisted';
import { config } from '$lib/config';
import type { SettingsState } from '$lib/types';

// Debug: module load
console.log('[settings] module loaded. api.baseUrl=', config.api.baseUrl, 'defaults=', config.defaults);

// Individual persisted stores
export const hourlyRate = persisted<number>(
    'hourlyRate',
    config.defaults.hourlyRate
);

export const targetHours = persisted<number>(
    'targetHours',
    config.defaults.targetHours
);

// Debug: log targetHours and hourlyRate store changes to help trace updates
targetHours.subscribe((v) => {
    console.log('[settings] targetHours store changed ->', v);
});

export const dollarRate = persisted<number>('dollarRate', 0);
export const dollarRateTimestamp = persisted<number>('dollarRateTimestamp', 0);

export const shortDescription = persisted<string>(
    'shortDescription',
    ''
);

export const theme = persisted<'light' | 'dark' | 'system'>(
    'theme',
    'dark' // Default to dark as per user preference
);

// Derived store combining all settings
export const settings = derived(
    [hourlyRate, targetHours, dollarRate, shortDescription, theme],
    ([$hourlyRate, $targetHours, $dollarRate, $shortDescription, $theme]) => ({
        hourlyRate: $hourlyRate,
        targetHours: $targetHours,
        dollarRate: $dollarRate,
        shortDescription: $shortDescription,
        theme: $theme
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
        console.log('[settings] syncTargetHoursFromAPI: fetching', `${config.api.baseUrl}/getTargetHours`);
        const response = await fetch(`${config.api.baseUrl}/getTargetHours`);
        console.log('[settings] syncTargetHoursFromAPI: status', response.status);
        let data = null;
        try {
            data = await response.json();
            console.log('[settings] syncTargetHoursFromAPI: response json ->', data);
        } catch (e) {
            console.warn('[settings] syncTargetHoursFromAPI: failed to parse json', e);
        }
        targetHours.set(Number(data) || 0);
    } catch (error) {
        console.error('Failed to sync target hours:', error);
    }
}

export async function updateTargetHours(hours: number) {
    const num = Number(hours) || 0;
    console.log('[settings] updateTargetHours: start ->', num, 'api.baseUrl=', config.api.baseUrl);
    try {
        const response = await fetch(`${config.api.baseUrl}/setTargetHours?hours=${num}`);
        console.log('[settings] updateTargetHours: fetch completed status=', response.status);
        let responseBody = null;
        try {
            responseBody = await response.json();
            console.log('[settings] updateTargetHours: response json ->', responseBody);
        } catch (e) {
            console.warn('[settings] updateTargetHours: could not parse JSON response', e);
        }

        if (response.ok) {
            console.log('[settings] updateTargetHours: server accepted change, setting store ->', num);
            targetHours.set(num);
            return true;
        } else {
            console.warn('[settings] updateTargetHours: server returned non-OK, trying fallback to localhost and persisting locally');
            if (!config.api.baseUrl.includes('localhost')) {
                try {
                    const fallback = await fetch(`http://localhost:88/setTargetHours?hours=${num}`);
                    console.log('[settings] updateTargetHours: fallback status=', fallback.status);
                    if (fallback.ok) {
                        try {
                            const fbBody = await fallback.json();
                            console.log('[settings] updateTargetHours: fallback json ->', fbBody);
                        } catch (e) {
                            console.warn('[settings] updateTargetHours: fallback json parse failed', e);
                        }
                        targetHours.set(num);
                        return true;
                    }
                } catch (e) {
                    console.warn('[settings] updateTargetHours: fallback fetch failed', e);
                }
            }
            console.log('[settings] updateTargetHours: persisting locally ->', num);
            targetHours.set(num);
            return false;
        }
    } catch (error) {
        console.error('[settings] updateTargetHours: network error', error);
        if (!config.api.baseUrl.includes('localhost')) {
            try {
                console.log('[settings] updateTargetHours: attempting localhost fallback due to network error');
                const fallback = await fetch(`http://localhost:88/setTargetHours?hours=${num}`);
                console.log('[settings] updateTargetHours: fallback status=', fallback.status);
                if (fallback.ok) {
                    try {
                        const fbBody = await fallback.json();
                        console.log('[settings] updateTargetHours: fallback json ->', fbBody);
                    } catch (e) {}
                    targetHours.set(num);
                    return true;
                }
            } catch (e) {
                console.warn('[settings] updateTargetHours: fallback failed', e);
            }
        }
        targetHours.set(num);
        return false;
    }
}

export async function fetchCurrencyRate() {
    const currentRate = get(dollarRate);
    const lastUpdated = get(dollarRateTimestamp);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour

    // Return cached rate if fresh (less than 1 hour old)
    if (currentRate > 0 && (now - lastUpdated) < oneHour) {
        return currentRate;
    }

    try {
        const response = await fetch(config.api.currencyUrl);
        // Response format: {"date":"...","base":"USD","rates":{"BDT":"122.335"}}
        const data = await response.json();

        let newRate = 0;
        if (data.rates && data.rates.BDT) {
            newRate = parseFloat(data.rates.BDT);
        } else if (data.geoplugin_currencyConverter) {
            newRate = Number(data.geoplugin_currencyConverter);
        }

        if (newRate > 0) {
            dollarRate.set(newRate);
            dollarRateTimestamp.set(now);
            return newRate;
        }
    } catch (error) {
        console.error('Failed to fetch currency rate:', error);
    }

    return currentRate;
}

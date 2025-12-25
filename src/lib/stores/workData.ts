import { writable, derived, get } from 'svelte/store';
import { format, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears, isToday } from 'date-fns';
import type { WorkData, WorkDataState, DateRange, WorkEntry, WorkTimeResponse } from '$lib/types';
import { config } from '$lib/config';

// View mode for determining comparison context
export const viewMode = writable<'week' | 'month' | 'year'>('week');

// Current date range (will be calculated based on view mode)
export const dateRange = writable<DateRange>({
    startDate: startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
    endDate: endOfWeek(new Date(), { weekStartsOn: 1 }) // Sunday
});

// Work data state
export const workDataState = writable<WorkDataState>({
    currentWeek: { entries: [], totalHours: 0, totalMinutes: 0 },
    previousWeek: { entries: [], totalHours: 0, totalMinutes: 0 },
    todayWork: null,
    isLoading: false,
    error: null
});

// Derived stores for easy access
export const currentWeekData = derived(
    workDataState,
    ($state) => $state.currentWeek
);

export const previousWeekData = derived(
    workDataState,
    ($state) => $state.previousWeek
);

export const isLoading = derived(
    workDataState,
    ($state) => $state.isLoading
);

export const error = derived(
    workDataState,
    ($state) => $state.error
);

// Helper function to calculate totals from entries
function calculateTotals(entries: WorkEntry[]): WorkData {
    // Sum duration + extra minutes for totals
    const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration + (entry.extraminutes || 0), 0);
    return {
        entries,
        totalHours: Math.floor(totalMinutes / 60),
        totalMinutes: totalMinutes % 60
    };
}

// Fetch work data for a date range
export async function fetchWorkData(start: Date, end: Date): Promise<WorkData> {
    const startStr = format(start, 'yyyy-MM-dd');
    const endStr = format(end, 'yyyy-MM-dd');

    try {
        const response = await fetch(
            `${config.api.baseUrl}/work-data?startDate=${startStr}&endDate=${endStr}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch work data');
        }

        const data = await response.json();

        // Backend returns array directly: [...]
        // Ensure we handle that
        const rows = Array.isArray(data) ? data : [];

        // Map raw backend data to internal WorkEntry format
        const mappedEntries: WorkEntry[] = rows.map((item: any) => ({
            date: item.date,
            startTime: item.startTime || '',
            endTime: item.endTime || '',
            description: item.description || '',
            // Calculate total duration in minutes from backend fields
            // NOTE: duration should be tracked duration. Extra minutes are separate.
            duration: (Number(item.hours || 0) * 60) + Number(item.minutes || 0),
            extraminutes: Number(item.extraminutes || 0),
            // Parse detailedWork if available
            detailedWork: item.detailedWork ? (typeof item.detailedWork === 'string' ? JSON.parse(item.detailedWork) : item.detailedWork) : []
        }));

        return calculateTotals(mappedEntries);
    } catch (error) {
        console.error('Error fetching work data:', error);
        throw error;
    }
}

// Fetch today's live work time
export async function fetchTodayWork() {
    try {
        const response = await fetch(`${config.api.baseUrl}/worktime`);

        if (!response.ok) {
            throw new Error('Failed to fetch today work');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching today work:', error);
        return null;
    }
}

// Main function to load all work data
export async function loadWorkData() {
    const range = get(dateRange);
    const mode = get(viewMode);

    workDataState.update((state) => ({
        ...state,
        isLoading: true,
        error: null
    }));

    try {
        // Calculate previous period range based on view mode
        let prevStart: Date;
        let prevEnd: Date;

        if (mode === 'week') {
            prevStart = startOfWeek(subWeeks(range.startDate, 1), { weekStartsOn: 1 });
            prevEnd = endOfWeek(subWeeks(range.endDate, 1), { weekStartsOn: 1 });
        } else if (mode === 'month') {
            prevStart = startOfMonth(subMonths(range.startDate, 1));
            prevEnd = endOfMonth(subMonths(range.endDate, 1));
        } else { // year
            prevStart = startOfYear(subYears(range.startDate, 1));
            prevEnd = endOfYear(subYears(range.endDate, 1));
        }

        // Fetch current and previous period data in parallel
        const [currentRaw, previousWeek] = await Promise.all([
            fetchWorkData(range.startDate, range.endDate),
            fetchWorkData(prevStart, prevEnd)
        ]);

        // Merge today's data if applicable
        const { data: currentWeek, todayWork } = await mergeTodayData(currentRaw, range.startDate, range.endDate);

        workDataState.set({
            currentWeek,
            previousWeek,
            todayWork,
            isLoading: false,
            error: null
        });
    } catch (error) {
        workDataState.update((state) => ({
            ...state,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }));
    }
}

async function mergeTodayData(currentData: WorkData, rangeStart: Date, rangeEnd: Date): Promise<{ data: WorkData, todayWork: WorkTimeResponse | null }> {
    const today = new Date();
    // Only proceed if today is within the current range
    if (today < rangeStart || today > rangeEnd) {
        return { data: currentData, todayWork: null };
    }

    try {
        const todayWorkResponse = await fetchTodayWork();
        if (!todayWorkResponse) return { data: currentData, todayWork: null };

        // /worktime returns an array of objects
        const todayData = Array.isArray(todayWorkResponse) ? todayWorkResponse[0] : todayWorkResponse;

        if (!todayData) return { data: currentData, todayWork: null };

        // Calculate today's totals for the separate widget
        const todayWidgetData: WorkTimeResponse = {
            hours: Number(todayData.hours) || 0,
            minutes: Number(todayData.minutes) || 0,
            totalMinutes: (Number(todayData.hours || 0) * 60) + Number(todayData.minutes || 0)
        };

        // Merge into entries
        const todayStr = format(today, 'yyyy-MM-dd');
        const entries = [...currentData.entries];
        const existingIndex = entries.findIndex(e => e.date === todayStr);

        const newEntry: WorkEntry = {
            date: todayStr,
            startTime: '',
            endTime: '',
            duration: todayWidgetData.totalMinutes,
            description: 'Today',
            detailedWork: todayData.detailedWork ? (typeof todayData.detailedWork === 'string' ? JSON.parse(todayData.detailedWork) : todayData.detailedWork) : [],
            extraminutes: existingIndex >= 0 ? entries[existingIndex].extraminutes : 0
        };

        if (existingIndex >= 0) {
            entries[existingIndex] = {
                ...entries[existingIndex],
                duration: newEntry.duration,
                detailedWork: newEntry.detailedWork // Also update detailed work
            };
        } else {
            entries.push(newEntry);
        }

        return {
            data: calculateTotals(entries),
            todayWork: todayWidgetData
        };

    } catch (e) {
        console.error("Failed to merge today data", e);
        return { data: currentData, todayWork: null };
    }
}

// Navigate to next period (context-aware based on view mode)
export function nextPeriod() {
    // Implementation for next period navigation
}

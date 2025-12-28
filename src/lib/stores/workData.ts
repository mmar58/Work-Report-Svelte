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
        const rows = Array.isArray(data) ? data : [];

        // Generate all dates in range to ensure full week coverage
        const allDates: string[] = [];
        let currentDate = new Date(start);
        while (currentDate <= end) {
            allDates.push(format(currentDate, 'yyyy-MM-dd'));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Map backend data to a lookup map
        const backendDataMap = new Map(rows.map((item: any) => [item.date, item]));

        // Create entries for all dates, merging backend data where it exists
        const mappedEntries: WorkEntry[] = allDates.map(dateStr => {
            const item = backendDataMap.get(dateStr) || {};
            return {
                date: dateStr,
                startTime: item.startTime || '',
                endTime: item.endTime || '',
                description: item.description || '',
                duration: (Number(item.hours || 0) * 60) + Number(item.minutes || 0),
                extraminutes: Number(item.extraminutes || 0),
                detailedWork: item.detailedWork ? (typeof item.detailedWork === 'string' ? JSON.parse(item.detailedWork) : item.detailedWork) : []
            };
        });

        // Calculate totals from the filled entries
        return calculateTotals(mappedEntries);
    } catch (error) {
        console.error('Error fetching work data:', error);
        throw error;
    }
}

// Fetch today's live work time (or specific dates)
export async function fetchTodayWork(dates?: string[]) {
    try {
        let url = `${config.api.baseUrl}/worktime`;
        if (dates && dates.length > 0) {
            // Backend expects dd-mm-yyyy format for dates param
            // We assume input dates are already in correct format or we format them here if they are Date objects?
            // The plan said "formatting dates to `dd-mm-yyyy`".
            // Let's assume the input strings are yyyy-MM-dd (standard in this file) and convert them.
            // But wait, the backend python script expects "dates" parameter with "dd-mm-yyyy" format.
            // The frontend uses yyyy-MM-dd usually.
            // Let's convert here to be safe.
            const formattedDates = dates.map(d => {
                const [year, month, day] = d.split('-');
                return `${day}-${month}-${year}`;
            }).join(',');
            url += `?dates=${formattedDates}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch work time');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching work time:', error);
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
        const todayStr = format(today, 'yyyy-MM-dd');
        // Check if today data exists in currentData
        const hasTodayData = currentData.entries.some(e => e.date === todayStr && (e.duration > 0 || e.description));

        let fetchDates: string[] = [];
        if (!hasTodayData) {
            // If today is missing (or empty), fetch yesterday and today
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            fetchDates = [format(yesterday, 'yyyy-MM-dd'), todayStr];
        } else {
            // Otherwise just fetch today
            fetchDates = [todayStr];
        }

        const workResponse = await fetchTodayWork(fetchDates);
        if (!workResponse) return { data: currentData, todayWork: null };

        // workResponse is array if dates provided or single object/array from backend
        // Py script returns list of objects.
        const workItems: any[] = Array.isArray(workResponse) ? workResponse : [workResponse];

        // Find today's specific item for the widget
        const todayItem = workItems.find((item: any) => {
            // Backend item.date is dd-mm-yyyy usually based on python script?
            // Python script: date=dateText[2]+"-"+dateText[1]+"-"+dateText[0] (yyyy-MM-dd) in updateInDatabase?
            // Wait, the python script returns: `return {"date": self.date ...`
            // In `scrapWorkTime(today)`, `today` is d-m-Y.
            // But `HoursData` object takes that date.
            // If we called with dates=d-m-y, it returns that specific d-m-y string in the json.
            // So we need to match based on flattened date.
            // Let's normalize both to check.
            // easier: check if item.date matches today's formatted string (dd-mm-yyyy) which the backend uses for output?
            // looking at python: `return {"date": self.date ...` and `today=date.today().strftime("%d-%m-%Y")`
            // so the JSON response "date" field is "dd-mm-yyyy".
            const todayDayMonthYear = format(today, 'dd-MM-yyyy');
            return item.date === todayDayMonthYear;
        });

        let todayWidgetData: WorkTimeResponse | null = null;
        if (todayItem) {
            todayWidgetData = {
                hours: Number(todayItem.hours) || 0,
                minutes: Number(todayItem.minutes) || 0,
                totalMinutes: (Number(todayItem.hours || 0) * 60) + Number(todayItem.minutes || 0)
            };
        }

        // Merge all fetched items into entries
        const entries = [...currentData.entries];

        for (const item of workItems) {
            // Item date from backend is dd-mm-yyyy
            // We need yyyy-MM-dd for our frontend entries
            const [d, m, y] = item.date.split('-');
            const itemDateStr = `${y}-${m}-${d}`;

            const existingIndex = entries.findIndex(e => e.date === itemDateStr);

            const totalMinutes = (Number(item.hours || 0) * 60) + Number(item.minutes || 0);

            const newEntryVal: WorkEntry = {
                date: itemDateStr,
                startTime: '', // Backend doesn't return this in the list?
                endTime: '',
                duration: totalMinutes,
                description: item.mote || item.note || 'Synced', // 'mote' typo in python script
                detailedWork: item.detailedWork ? (typeof item.detailedWork === 'string' ? JSON.parse(item.detailedWork) : item.detailedWork) : [],
                extraminutes: Number(item.extraMinutes || 0)
            };

            if (existingIndex >= 0) {
                // Preserve startTime/endTime/extraminutes if not in response?
                // The python response includes extraMinutes.
                entries[existingIndex] = {
                    ...entries[existingIndex],
                    duration: newEntryVal.duration,
                    description: newEntryVal.description || entries[existingIndex].description,
                    detailedWork: newEntryVal.detailedWork,
                    extraminutes: newEntryVal.extraminutes
                };
            } else if (itemDateStr >= format(rangeStart, 'yyyy-MM-dd') && itemDateStr <= format(rangeEnd, 'yyyy-MM-dd')) {
                // Only add if within range (though fetch should only return asked dates)
                entries.push(newEntryVal);
            }
        }

        // ensure sorting? entries are usually sorted by date in loadWorkData by virtue of creation. 
        // But if we pushed new ones (unlikely if we just updating), we might need sort.
        // But `yesterday` should already be in the list if the list covers the week.

        return {
            data: calculateTotals(entries),
            todayWork: todayWidgetData
        };

    } catch (e) {
        console.error("Failed to merge today data", e);
        return { data: currentData, todayWork: null };
    }
}

// Check if today is visible and refresh data
export async function refreshTodayDataIfVisible() {
    const range = get(dateRange);
    const today = new Date();

    // Check if today is within range (inclusive)
    if (today >= range.startDate && today <= range.endDate) {
        const { currentWeek } = get(workDataState);
        const { data: updatedData, todayWork } = await mergeTodayData(currentWeek, range.startDate, range.endDate);

        workDataState.update(state => ({
            ...state,
            currentWeek: updatedData,
            todayWork
        }));
    }
}

// Navigate to next period (context-aware based on view mode)
export function nextPeriod() {
    // Implementation for next period navigation
}

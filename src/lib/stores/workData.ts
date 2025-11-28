import { writable, derived, get } from 'svelte/store';
import {
	startOfWeek,
	endOfWeek,
	format,
	isToday,
	subWeeks,
	subMonths,
	subYears,
	addWeeks,
	addMonths,
	addYears,
	startOfMonth,
	endOfMonth,
	startOfYear,
	endOfYear
} from 'date-fns';
import type { WorkData, WorkDataState, DateRange, WorkEntry, ViewMode } from '$lib/types';
import { formatDateISO, formatDateForAPI } from '$lib/utils/dateUtils';

// View mode for determining comparison context
export const viewMode = writable<ViewMode>('week');

// Current date range (will be calculated based on view mode)
export const dateRange = writable<DateRange>({
	startDate: startOfWeek(new Date(), { weekStartsOn: 1 }), // Monday
	endDate: endOfWeek(new Date(), { weekStartsOn: 1 }) // Sunday
});

// Work data state
export const workDataState = writable<WorkDataState>({
	currentWeek: { entries: [], totalHours: 0, totalMinutes: 0 },
	previousWeek: { entries: [], totalHours: 0, totalMinutes: 0 },
	todayWork: { entries: [], totalHours: 0, totalMinutes: 0 },
	isLoading: false,
	error: null
});

// Derived stores for easy access
export const currentWeekData = derived(workDataState, ($state) => $state.currentWeek);

export const previousWeekData = derived(workDataState, ($state) => $state.previousWeek);

export const todayWorkData = derived(workDataState, ($state) => $state.todayWork);

export const isLoading = derived(workDataState, ($state) => $state.isLoading);

export const error = derived(workDataState, ($state) => $state.error);

// Helper function to calculate totals from entries
function calculateTotals(entries: WorkEntry[]): WorkData {
	const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0);
	return {
		entries,
		totalHours: Math.floor(totalMinutes / 60),
		totalMinutes
	};
}

// Fetch work data for a date range
export async function fetchWorkData(start: Date, end: Date): Promise<WorkData> {
	const startStr = formatDateISO(start);
	const endStr = formatDateISO(end);

	try {
		const response = await fetch(`/api/work-data?startDate=${startStr}&endDate=${endStr}`);
		if (!response.ok) {
			throw new Error('Failed to fetch work data');
		}
		const data = await response.json();
		return calculateTotals(data.workData || []);
	} catch (error) {
		console.error('Error fetching work data:', error);
		return { entries: [], totalHours: 0, totalMinutes: 0 };
	}
}

// Fetch today's live work time
export async function fetchTodayWork(): Promise<WorkData> {
	try {
		const response = await fetch('/api/work-data/today');
		if (!response.ok) {
			throw new Error('Failed to fetch today work');
		}
		const data = await response.json();
		const totalMinutes = data.totalMinutes || 0;
		return {
			entries: [],
			totalHours: Math.floor(totalMinutes / 60),
			totalMinutes
		};
	} catch (error) {
		console.error('Error fetching today work:', error);
		return { entries: [], totalHours: 0, totalMinutes: 0 };
	}
}

// Main function to load all work data
export async function loadWorkData() {
	const range = get(dateRange);
	const mode = get(viewMode);

	workDataState.update((state) => ({ ...state, isLoading: true, error: null }));

	try {
		// Calculate previous period based on view mode
		let prevStart: Date, prevEnd: Date;

		switch (mode) {
			case 'week':
				prevStart = startOfWeek(subWeeks(range.startDate, 1), { weekStartsOn: 1 });
				prevEnd = endOfWeek(subWeeks(range.startDate, 1), { weekStartsOn: 1 });
				break;
			case 'month':
				prevStart = startOfMonth(subMonths(range.startDate, 1));
				prevEnd = endOfMonth(subMonths(range.startDate, 1));
				break;
			case 'year':
				prevStart = startOfYear(subYears(range.startDate, 1));
				prevEnd = endOfYear(subYears(range.startDate, 1));
				break;
		}

		// Fetch data in parallel
		const [currentData, previousData, todayData] = await Promise.all([
			fetchWorkData(range.startDate, range.endDate),
			fetchWorkData(prevStart, prevEnd),
			fetchTodayWork()
		]);

		workDataState.set({
			currentWeek: currentData,
			previousWeek: previousData,
			todayWork: todayData,
			isLoading: false,
			error: null
		});
	} catch (error) {
		console.error('Error loading work data:', error);
		workDataState.update((state) => ({
			...state,
			isLoading: false,
			error: error instanceof Error ? error.message : 'Failed to load work data'
		}));
	}
}

// Navigate to next period (context-aware based on view mode)
export function nextPeriod() {
	const mode = get(viewMode);
	const range = get(dateRange);

	let newStart: Date, newEnd: Date;

	switch (mode) {
		case 'week':
			newStart = startOfWeek(addWeeks(range.startDate, 1), { weekStartsOn: 1 });
			newEnd = endOfWeek(addWeeks(range.startDate, 1), { weekStartsOn: 1 });
			break;
		case 'month':
			newStart = startOfMonth(addMonths(range.startDate, 1));
			newEnd = endOfMonth(addMonths(range.startDate, 1));
			break;
		case 'year':
			newStart = startOfYear(addYears(range.startDate, 1));
			newEnd = endOfYear(addYears(range.startDate, 1));
			break;
	}

	dateRange.set({ startDate: newStart, endDate: newEnd });
	loadWorkData();
}

// Navigate to previous period (context-aware based on view mode)
export function previousPeriod() {
	const mode = get(viewMode);
	const range = get(dateRange);

	let newStart: Date, newEnd: Date;

	switch (mode) {
		case 'week':
			newStart = startOfWeek(subWeeks(range.startDate, 1), { weekStartsOn: 1 });
			newEnd = endOfWeek(subWeeks(range.startDate, 1), { weekStartsOn: 1 });
			break;
		case 'month':
			newStart = startOfMonth(subMonths(range.startDate, 1));
			newEnd = endOfMonth(subMonths(range.startDate, 1));
			break;
		case 'year':
			newStart = startOfYear(subYears(range.startDate, 1));
			newEnd = endOfYear(subYears(range.startDate, 1));
			break;
	}

	dateRange.set({ startDate: newStart, endDate: newEnd });
	loadWorkData();
}

// Set view mode and refresh data
export function setViewMode(mode: ViewMode) {
	const currentRange = get(dateRange);
	viewMode.set(mode);

	// Recalculate date range based on new mode, keeping the current reference date
	const referenceDate = currentRange.startDate;
	let newStart: Date, newEnd: Date;

	switch (mode) {
		case 'week':
			newStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
			newEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
			break;
		case 'month':
			newStart = startOfMonth(referenceDate);
			newEnd = endOfMonth(referenceDate);
			break;
		case 'year':
			newStart = startOfYear(referenceDate);
			newEnd = endOfYear(referenceDate);
			break;
	}

	dateRange.set({ startDate: newStart, endDate: newEnd });
	loadWorkData();
}

// Legacy function names for backward compatibility
export const nextWeek = nextPeriod;
export const previousWeek = previousPeriod;

// Refresh current data
export function refreshWorkData() {
	return loadWorkData();
}

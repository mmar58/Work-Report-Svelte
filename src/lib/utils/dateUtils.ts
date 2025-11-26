import {
	format,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	startOfYear,
	endOfYear,
	subWeeks,
	subMonths,
	subYears,
	addWeeks,
	addMonths,
	addYears,
	eachDayOfInterval,
	isToday,
	isSameDay,
	parseISO
} from 'date-fns';
import type { DateRange, ViewMode } from '$lib/types';

/**
 * Get the start and end dates for the current period based on view mode
 */
export function getCurrentPeriod(mode: ViewMode = 'week'): DateRange {
	const now = new Date();

	switch (mode) {
		case 'week':
			return {
				startDate: startOfWeek(now, { weekStartsOn: 1 }), // Monday
				endDate: endOfWeek(now, { weekStartsOn: 1 }) // Sunday
			};
		case 'month':
			return {
				startDate: startOfMonth(now),
				endDate: endOfMonth(now)
			};
		case 'year':
			return {
				startDate: startOfYear(now),
				endDate: endOfYear(now)
			};
	}
}

/**
 * Get the previous period based on view mode
 */
export function getPreviousPeriod(current: DateRange, mode: ViewMode = 'week'): DateRange {
	switch (mode) {
		case 'week':
			const prevWeekStart = subWeeks(current.startDate, 1);
			return {
				startDate: startOfWeek(prevWeekStart, { weekStartsOn: 1 }),
				endDate: endOfWeek(prevWeekStart, { weekStartsOn: 1 })
			};
		case 'month':
			const prevMonthStart = subMonths(current.startDate, 1);
			return {
				startDate: startOfMonth(prevMonthStart),
				endDate: endOfMonth(prevMonthStart)
			};
		case 'year':
			const prevYearStart = subYears(current.startDate, 1);
			return {
				startDate: startOfYear(prevYearStart),
				endDate: endOfYear(prevYearStart)
			};
	}
}

/**
 * Get the next period based on view mode
 */
export function getNextPeriod(current: DateRange, mode: ViewMode = 'week'): DateRange {
	switch (mode) {
		case 'week':
			const nextWeekStart = addWeeks(current.startDate, 1);
			return {
				startDate: startOfWeek(nextWeekStart, { weekStartsOn: 1 }),
				endDate: endOfWeek(nextWeekStart, { weekStartsOn: 1 })
			};
		case 'month':
			const nextMonthStart = addMonths(current.startDate, 1);
			return {
				startDate: startOfMonth(nextMonthStart),
				endDate: endOfMonth(nextMonthStart)
			};
		case 'year':
			const nextYearStart = addYears(current.startDate, 1);
			return {
				startDate: startOfYear(nextYearStart),
				endDate: endOfYear(nextYearStart)
			};
	}
}

/**
 * Format a date range as a readable string
 */
export function formatDateRange(range: DateRange, mode: ViewMode = 'week'): string {
	switch (mode) {
		case 'week':
			return `${format(range.startDate, 'MMM d')} - ${format(range.endDate, 'MMM d, yyyy')}`;
		case 'month':
			return format(range.startDate, 'MMMM yyyy');
		case 'year':
			return format(range.startDate, 'yyyy');
	}
}

/**
 * Get all days in a date range
 */
export function getDaysInRange(range: DateRange): Date[] {
	return eachDayOfInterval({
		start: range.startDate,
		end: range.endDate
	});
}

/**
 * Check if a date is today
 */
export function checkIsToday(date: Date | string): boolean {
	const dateObj = typeof date === 'string' ? parseISO(date) : date;
	return isToday(dateObj);
}

/**
 * Check if two dates are the same day
 */
export function checkIsSameDay(date1: Date | string, date2: Date | string): boolean {
	const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
	const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
	return isSameDay(dateObj1, dateObj2);
}

/**
 * Format date for API (DD-MM-YYYY)
 */
export function formatDateForAPI(date: Date): string {
	return format(date, 'dd-MM-yyyy');
}

/**
 * Format date as ISO (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
	return format(date, 'yyyy-MM-dd');
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(dateString: string): Date {
	return parseISO(dateString);
}

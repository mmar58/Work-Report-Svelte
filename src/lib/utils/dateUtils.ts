import { startOfWeek, endOfWeek, subWeeks, subMonths, subYears, format, addDays, getDay, differenceInDays } from 'date-fns';

/**
 * Seconds to H:M:S string
 */
export function secondsToTime(totalSeconds: number): string {
    if (totalSeconds < 0) totalSeconds = 0;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Returns formatted start/end dates for the current week (Mon-Sun)
 */
export function getCurrentWeekRange() {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });

    return {
        start: format(start, 'yyyy-MM-dd'),
        end: format(end, 'yyyy-MM-dd'),
        startObj: start,
        endObj: end
    };
}

/**
 * Get date range for context-aware previous period
 */
export function getPreviousPeriodRange(currentStart: Date, currentEnd: Date, viewMode: 'week' | 'month' | 'year') {
    if (viewMode === 'week') {
        const start = subWeeks(currentStart, 1);
        const end = subWeeks(currentEnd, 1);
        return { start, end };
    } else if (viewMode === 'month') {
        const start = subMonths(currentStart, 1);
        const end = subMonths(currentEnd, 1);
        return { start, end };
    } else {
        const start = subYears(currentStart, 1);
        const end = subYears(currentEnd, 1);
        return { start, end };
    }
}

import { differenceInDays, endOfWeek } from 'date-fns';

/**
 * Calculate weekly earnings
 */
export function calculateEarnings(totalHours: number, totalMinutes: number, hourlyRate: number): number {
    const hoursDecimal = totalHours + (totalMinutes / 60);
    return hoursDecimal * hourlyRate;
}

/**
 * Calculate remaining days in the week
 */
export function calculateRemainingDays(): number {
    const today = new Date();
    const endWeek = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
    const diff = differenceInDays(endWeek, today);
    // If today is Sunday, diff is 0, but we might still have work to do today.
    // Assuming 5 day work week? Or 7? The prompt says "Remaining Days Calculator". 
    // Usually includes today if not finished.
    return Math.max(0, diff + 1);
}

/**
 * Calculate required daily hours to meet target
 */
export function calculateRequiredDaily(
    currentTotalMinutes: number,
    targetHours: number,
    remainingDays: number
): { hours: number, minutes: number } {
    const targetMinutes = targetHours * 60;
    const remainingMinutes = Math.max(0, targetMinutes - currentTotalMinutes);

    if (remainingDays <= 0) return { hours: 0, minutes: 0 };

    const dailyMinutes = Math.ceil(remainingMinutes / remainingDays);
    return {
        hours: Math.floor(dailyMinutes / 60),
        minutes: dailyMinutes % 60
    };
}

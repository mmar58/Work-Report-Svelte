import type { WorkData, WorkEntry } from '$lib/types';
import { format, differenceInDays, endOfWeek } from 'date-fns';

/**
 * Calculate total hours and minutes from work entries
 */
export function calculateTotals(entries: WorkEntry[]): WorkData {
	const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0);
	return {
		entries,
		totalHours: Math.floor(totalMinutes / 60),
		totalMinutes
	};
}

/**
 * Calculate total earnings based on hours and rate
 * @param totalMinutes - Total minutes worked
 * @param hourlyRate - Hourly rate
 * @returns Total earnings
 */
export function calculateEarnings(totalMinutes: number, hourlyRate: number): number {
	const hours = totalMinutes / 60;
	return hours * hourlyRate;
}

/**
 * Calculate earnings in BDT (using dollar rate)
 * @param totalMinutes - Total minutes worked
 * @param hourlyRate - Hourly rate in USD
 * @param dollarRate - USD to BDT conversion rate
 * @returns Total earnings in BDT
 */
export function calculateEarningsInBDT(
	totalMinutes: number,
	hourlyRate: number,
	dollarRate: number
): number {
	const earningsUSD = calculateEarnings(totalMinutes, hourlyRate);
	return earningsUSD * dollarRate;
}

/**
 * Calculate remaining days in current week
 * @param currentDate - Current date
 * @returns Number of days remaining (including today)
 */
export function calculateRemainingDays(currentDate: Date = new Date()): number {
	const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // Sunday
	return differenceInDays(weekEnd, currentDate) + 1; // Include today
}

/**
 * Calculate required hours per day to meet target
 * @param targetHours - Target hours for the week
 * @param currentMinutes - Minutes already worked
 * @param remainingDays - Days remaining in week
 * @returns Required hours per remaining day
 */
export function calculateRequiredHoursPerDay(
	targetHours: number,
	currentMinutes: number,
	remainingDays: number
): number {
	if (remainingDays <= 0) return 0;

	const targetMinutes = targetHours * 60;
	const remainingMinutes = targetMinutes - currentMinutes;

	if (remainingMinutes <= 0) return 0;

	return remainingMinutes / 60 / remainingDays;
}

/**
 * Calculate progress percentage towards target
 * @param currentMinutes - Minutes worked
 * @param targetHours - Target hours
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(currentMinutes: number, targetHours: number): number {
	const targetMinutes = targetHours * 60;
	if (targetMinutes === 0) return 0;
	return Math.min(Math.round((currentMinutes / targetMinutes) * 100), 100);
}

/**
 * Group work entries by date
 * @param entries - Work entries to group
 * @returns Map of date to entries
 */
export function groupEntriesByDate(entries: WorkEntry[]): Map<string, WorkEntry[]> {
	const grouped = new Map<string, WorkEntry[]>();

	for (const entry of entries) {
		const dateKey = entry.date;
		if (!grouped.has(dateKey)) {
			grouped.set(dateKey, []);
		}
		grouped.get(dateKey)!.push(entry);
	}

	return grouped;
}

/**
 * Calculate daily totals from entries
 * @param entries - Work entries
 * @returns Array of date and total minutes
 */
export function calculateDailyTotals(
	entries: WorkEntry[]
): Array<{ date: string; totalMinutes: number }> {
	const grouped = groupEntriesByDate(entries);
	const dailyTotals: Array<{ date: string; totalMinutes: number }> = [];

	grouped.forEach((dayEntries, date) => {
		const totalMinutes = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);
		dailyTotals.push({ date, totalMinutes });
	});

	return dailyTotals.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate extra minutes beyond full hours
 * @param totalMinutes - Total minutes worked
 * @returns Minutes beyond the last full hour
 */
export function calculateExtraMinutes(totalMinutes: number): number {
	return totalMinutes % 60;
}

/**
 * Generate work report text
 * @param startDate - Start date of period
 * @param endDate - End date of period
 * @param totalMinutes - Total minutes worked
 * @param hourlyRate - Hourly rate
 * @param dollarRate - USD to BDT rate
 * @param shortDescription - Short description of work
 * @returns Formatted report text
 */
export function generateWorkReport(
	startDate: string,
	endDate: string,
	totalMinutes: number,
	hourlyRate: number,
	dollarRate: number,
	shortDescription: string
): string {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	const earningsUSD = calculateEarnings(totalMinutes, hourlyRate);
	const earningsBDT = calculateEarningsInBDT(totalMinutes, hourlyRate, dollarRate);

	let report = `Work Report\n`;
	report += `Period: ${startDate} to ${endDate}\n\n`;
	if (shortDescription) {
		report += `Description: ${shortDescription}\n\n`;
	}
	report += `Total Hours: ${hours}h ${minutes}m\n`;
	report += `Hourly Rate: $${hourlyRate}/hr\n`;
	report += `Total Earnings: $${earningsUSD.toFixed(2)} (৳${earningsBDT.toFixed(2)})\n`;

	return report;
}

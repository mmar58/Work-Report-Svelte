/**
 * Format minutes to hours and minutes display
 * @param totalMinutes - Total minutes to format
 * @returns Formatted string like "8h 30m"
 */
export function formatDuration(totalMinutes: number): string {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	if (hours === 0) {
		return `${minutes}m`;
	}
	if (minutes === 0) {
		return `${hours}h`;
	}
	return `${hours}h ${minutes}m`;
}

/**
 * Format minutes as decimal hours
 * @param totalMinutes - Total minutes
 * @returns Decimal hours like "8.5"
 */
export function minutesToDecimalHours(totalMinutes: number): number {
	return totalMinutes / 60;
}

/**
 * Format money amount
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted money string like "$1,234.56"
 */
export function formatMoney(amount: number, currency = 'USD', decimals = 2): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(amount);
}

/**
 * Format number with thousand separators
 * @param num - Number to format
 * @returns Formatted number string like "1,234.56"
 */
export function formatNumber(num: number, decimals = 2): string {
	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(num);
}

/**
 * Format time in HH:MM format
 * @param timeString - Time string to format
 * @returns Formatted time like "09:30"
 */
export function formatTime(timeString: string): string {
	// If already in HH:MM format, return as is
	if (/^\d{2}:\d{2}$/.test(timeString)) {
		return timeString;
	}
	// Try to parse and format
	try {
		const date = new Date(`2000-01-01T${timeString}`);
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	} catch {
		return timeString;
	}
}

/**
 * Calculate percentage
 * @param current - Current value
 * @param total - Total value
 * @returns Percentage (0-100)
 */
export function calculatePercentage(current: number, total: number): number {
	if (total === 0) return 0;
	return Math.min(Math.round((current / total) * 100), 100);
}

/**
 * Format percentage
 * @param percentage - Percentage value
 * @returns Formatted percentage string like "75%"
 */
export function formatPercentage(percentage: number): string {
	return `${Math.round(percentage)}%`;
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - 3) + '...';
}

/**
 * Convert minutes to time string (HH:MM)
 */
export function minutesToTimeString(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

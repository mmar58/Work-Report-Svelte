/**
 * Formats a monetary value
 */
export function formatMoney(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount);
}

/**
 * Formats minutes into HH:mm format
 */
export function formatDuration(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
}

/**
 * Formats a date into a readable string
 */
export function formatDate(date: Date, formatStr = 'PPP'): string {
    // We can use date-fns format here if we import it, 
    // or use Intl.DateTimeFormat for lighter weight if formatStr is simple
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

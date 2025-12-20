import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

export const GET: RequestHandler = async ({ fetch }) => {
    try {
        const response = await fetch(`${config.api.baseUrl}/worktime`);
        if (!response.ok) throw new Error('Backend error');
        const data = await response.json();
        // Transform backend array response to expected object format if needed
        // Backend returns [{ date, hours, minutes, seconds, detailedWork }]
        if (Array.isArray(data) && data.length > 0) {
            const today = data[0];
            return json({
                hours: today.hours,
                minutes: today.minutes,
                totalMinutes: (today.hours * 60) + today.minutes,
                detailedWork: today.detailedWork // Pass raw JSON string or parsed object
            });
        }
        return json({ hours: 0, minutes: 0, totalMinutes: 0 });
    } catch (err) {
        console.error('Today Work Error:', err);
        return json({ hours: 0, minutes: 0, totalMinutes: 0 });
    }
};

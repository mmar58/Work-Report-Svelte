import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

/**
 * GET /api/work-data/today
 * Proxy to backend worktime endpoint for today's data
 * Backend returns: [{ date, hours, minutes, seconds, detailedWork }]
 */
export const GET: RequestHandler = async ({ fetch }) => {
	try {
		const backendUrl = `${config.api.baseURL}${config.api.endpoints.workTime}`;
		const response = await fetch(backendUrl);

		if (!response.ok) {
			throw error(response.status, 'Failed to fetch today work data from backend');
		}

		const data = await response.json();
		
		// Backend returns array, we expect first element for today
		const todayData = Array.isArray(data) && data.length > 0 ? data[0] : null;
		
		if (!todayData) {
			return json({ totalMinutes: 0, hours: 0, minutes: 0, seconds: 0 });
		}
		
		// Convert to totalMinutes format expected by frontend
		const totalMinutes = (todayData.hours || 0) * 60 + (todayData.minutes || 0);
		
		return json({
			totalMinutes,
			hours: todayData.hours || 0,
			minutes: todayData.minutes || 0,
			seconds: todayData.seconds || 0,
			detailedWork: todayData.detailedWork || ''
		});
	} catch (err) {
		console.error('Today work data API error:', err);
		throw error(500, 'Internal server error');
	}
};

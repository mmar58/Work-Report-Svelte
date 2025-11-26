import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

/**
 * GET /api/work-data/today
 * Proxy to backend worktime endpoint for today's data
 */
export const GET: RequestHandler = async ({ fetch }) => {
	try {
		const backendUrl = `${config.api.baseURL}${config.api.endpoints.workTime}`;
		const response = await fetch(backendUrl);

		if (!response.ok) {
			throw error(response.status, 'Failed to fetch today work data from backend');
		}

		const data = await response.json();
		return json(data);
	} catch (err) {
		console.error('Today work data API error:', err);
		throw error(500, 'Internal server error');
	}
};

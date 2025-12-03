import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

/**
 * GET /api/hourly-rate
 * Proxy to backend /hourlyRate endpoint
 */
export const GET: RequestHandler = async ({ fetch }) => {
	try {
		const backendUrl = `${config.api.baseURL}${config.api.endpoints.hourlyRate}`;
		const response = await fetch(backendUrl);
		
		if (!response.ok) {
			throw error(response.status, 'Failed to fetch hourly rate from backend');
		}

		const rate = await response.json();
		return json({ rate: rate || 0 });
	} catch (err) {
		console.error('Hourly rate API error:', err);
		return json({ rate: 0 });
	}
};

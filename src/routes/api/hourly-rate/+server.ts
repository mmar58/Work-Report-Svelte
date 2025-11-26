import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

/**
 * GET /api/hourly-rate
 * Proxy to backend getHourlyRate endpoint
 */
export const GET: RequestHandler = async ({ fetch }) => {
	try {
		const backendUrl = `${config.api.baseURL}${config.api.endpoints.hourlyRate}`;
		const response = await fetch(backendUrl);

		if (!response.ok) {
			throw error(response.status, 'Failed to fetch hourly rate from backend');
		}

		const data = await response.json();
		return json({ rate: data || 0 });
	} catch (err) {
		console.error('Hourly rate API error:', err);
		return json({ rate: 0 });
	}
};

/**
 * POST /api/hourly-rate?rate=X
 * Proxy to backend setHourlyRate endpoint
 */
export const POST: RequestHandler = async ({ url, fetch }) => {
	const rate = url.searchParams.get('rate');

	if (!rate) {
		throw error(400, 'Missing required parameter: rate');
	}

	try {
		const backendUrl = `${config.api.baseURL}${config.api.endpoints.setHourlyRate}?rate=${rate}`;
		const response = await fetch(backendUrl, { method: 'POST' });

		if (!response.ok) {
			throw error(response.status, 'Failed to set hourly rate on backend');
		}

		const data = await response.json();
		return json(data);
	} catch (err) {
		console.error('Set hourly rate API error:', err);
		throw error(500, 'Internal server error');
	}
};

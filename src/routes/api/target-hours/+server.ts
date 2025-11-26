import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

/**
 * GET /api/target-hours
 * Proxy to backend getTargetHours endpoint
 */
export const GET: RequestHandler = async ({ fetch }) => {
	try {
		const backendUrl = `${config.api.baseURL}${config.api.endpoints.targetHours}`;
		const response = await fetch(backendUrl);

		if (!response.ok) {
			throw error(response.status, 'Failed to fetch target hours from backend');
		}

		const data = await response.json();
		return json({ hours: data || 40 });
	} catch (err) {
		console.error('Target hours API error:', err);
		return json({ hours: 40 });
	}
};

/**
 * POST /api/target-hours?hours=X
 * Proxy to backend setTargetHours endpoint
 */
export const POST: RequestHandler = async ({ url, fetch }) => {
	const hours = url.searchParams.get('hours');

	if (!hours) {
		throw error(400, 'Missing required parameter: hours');
	}

	try {
		const backendUrl = `${config.api.baseURL}${config.api.endpoints.setTargetHours}?hours=${hours}`;
		const response = await fetch(backendUrl, { method: 'POST' });

		if (!response.ok) {
			throw error(response.status, 'Failed to set target hours on backend');
		}

		const data = await response.json();
		return json(data);
	} catch (err) {
		console.error('Set target hours API error:', err);
		throw error(500, 'Internal server error');
	}
};

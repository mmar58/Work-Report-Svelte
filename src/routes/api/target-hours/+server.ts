import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

/**
 * GET /api/target-hours
 * GET /api/target-hours?hours=X (for setting)
 * Proxy to backend getTargetHours or setTargetHours endpoint
 */
export const GET: RequestHandler = async ({ url, fetch }) => {
	const hours = url.searchParams.get('hours');

	// If hours parameter is provided, set target hours
	if (hours) {
		try {
			const backendUrl = `${config.api.baseURL}${config.api.endpoints.setTargetHours}?hours=${hours}`;
			const response = await fetch(backendUrl);

			if (!response.ok) {
				throw error(response.status, 'Failed to set target hours on backend');
			}

			const data = await response.json();
			return json({ hours: data || 40 });
		} catch (err) {
			console.error('Set target hours API error:', err);
			throw error(500, 'Internal server error');
		}
	}

	// Otherwise, get target hours
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

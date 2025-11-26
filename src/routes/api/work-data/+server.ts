import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

/**
 * GET /api/work-data?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Proxy to backend work-data endpoint
 */
export const GET: RequestHandler = async ({ url, fetch }) => {
	const startDate = url.searchParams.get('startDate');
	const endDate = url.searchParams.get('endDate');

	if (!startDate || !endDate) {
		throw error(400, 'Missing required parameters: startDate and endDate');
	}

	try {
		const backendUrl = `${config.api.baseURL}${config.api.endpoints.workData}?startDate=${startDate}&endDate=${endDate}`;
		const response = await fetch(backendUrl);

		if (!response.ok) {
			throw error(response.status, 'Failed to fetch work data from backend');
		}

		const data = await response.json();
		return json({ workData: data });
	} catch (err) {
		console.error('Work data API error:', err);
		throw error(500, 'Internal server error');
	}
};

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

/**
 * GET /api/currency
 * Proxy to external currency API with fallback
 */
export const GET: RequestHandler = async ({ fetch }) => {
	try {
		const response = await fetch(config.api.currencyURL);

		if (!response.ok) {
			throw new Error('Currency API failed');
		}

		const data = await response.json();

		return json({
			geoplugin_currencyCode: data.geoplugin_currencyCode || 'BDT',
			geoplugin_currencyConverter: data.geoplugin_currencyConverter || 120
		});
	} catch (err) {
		console.error('Currency API error:', err);
		// Return fallback rate
		return json({
			geoplugin_currencyCode: 'BDT',
			geoplugin_currencyConverter: 120
		});
	}
};

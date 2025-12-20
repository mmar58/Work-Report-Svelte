import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

export const GET: RequestHandler = async ({ fetch }) => {
    try {
        const response = await fetch(config.api.currencyUrl);
        if (!response.ok) throw new Error('Currency API error');
        const data = await response.json();
        return json(data);
    } catch (err) {
        console.error('Currency Error:', err);
        return json({ geoplugin_currencyConverter: 0 });
    }
};

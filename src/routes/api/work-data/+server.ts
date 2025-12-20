import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

export const GET: RequestHandler = async ({ url, fetch }) => {
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!startDate || !endDate) {
        throw error(400, 'startDate and endDate are required');
    }

    try {
        const response = await fetch(`${config.api.baseUrl}/work-data?startDate=${startDate}&endDate=${endDate}`);
        if (!response.ok) {
            throw new Error('Failed to fetch from backend');
        }
        const data = await response.json();
        return new Response(JSON.stringify({ workData: data }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Proxy Error:', err);
        throw error(500, 'Failed to fetch work data');
    }
};

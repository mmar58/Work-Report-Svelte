import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

export const GET: RequestHandler = async ({ fetch }) => {
    try {
        const response = await fetch(`${config.api.baseUrl}/getTargetHours`);
        if (!response.ok) throw new Error('Backend error');
        const hours = await response.json();
        return json({ hours });
    } catch (err) {
        return json({ hours: 40 }); // Default
    }
};

export const POST: RequestHandler = async ({ url, fetch }) => {
    const hours = url.searchParams.get('hours');
    if (!hours) throw error(400, 'Hours required');

    try {
        await fetch(`${config.api.baseUrl}/setTargetHours?hours=${hours}`); // Assuming GET based on docs
        return json({ success: true });
    } catch (err) {
        throw error(500, 'Failed to set target hours');
    }
}

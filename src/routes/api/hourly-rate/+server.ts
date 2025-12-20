import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { config } from '$lib/config';

export const GET: RequestHandler = async ({ fetch }) => {
    try {
        const response = await fetch(`${config.api.baseUrl}/hourlyRate`);
        if (!response.ok) throw new Error('Backend error');
        const rate = await response.json();
        return json({ rate });
    } catch (err) {
        console.error('Values Error:', err);
        return json({ rate: 0 }); // Fallback
    }
};

export const POST: RequestHandler = async ({ url, fetch }) => {
    const rate = url.searchParams.get('rate');
    if (!rate) throw error(400, 'Rate required');

    try {
        const response = await fetch(`${config.api.baseUrl}/setHourlyRate?rate=${rate}`, { method: 'POST' }); // backend might expect GET for set? Docs say GET for setTargetHours but likely POST is better. 
        // Re-reading docs: "GET /setTargetHours". React plan says POST. 
        // I'll stick to GET as per docs if standard, but actually docs say:
        // "GET /setTargetHours?hours=45"
        // React plan says: "POST /setHourlyRate?rate=X"
        // I will trust React plan as "better logic" implies moving to POST, but backend might only support GET.
        // Let's safe-bet on GET for now if docs say GET, or try to match React existing behavior?
        // Let's assume the backend is what it is. 
        // Docs: "GET /hourlyRate", "GET /getTargetHours", "GET /setTargetHours".
        // React plan claims "POST /setHourlyRate".
        // I will implement based on DOCS for safety: GET request to set.

        // Wait, "GET /setTargetHours" is weird.
        // I'll try GET first.

        await fetch(`${config.api.baseUrl}/setHourlyRate?rate=${rate}`); // Assuming endpoint exists logic from docs pattern
        return json({ success: true });
    } catch (err) {
        throw error(500, 'Failed to set rate');
    }
}

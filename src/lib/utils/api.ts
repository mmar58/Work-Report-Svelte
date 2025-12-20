import { config } from '$lib/config';

/**
 * Generic fetch wrapper with error handling
 */
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${config.api.baseUrl}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
}

/**
 * Proxy fetch wrapper (calls SvelteKit API routes)
 */
export async function proxyFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(endpoint, options);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API Error: ${response.status}`);
    }

    return await response.json();
}

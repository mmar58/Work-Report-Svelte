import { config } from '$lib/config';

/**
 * Base API client for making requests
 */
class APIClient {
	private baseURL: string;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
		const url = new URL(endpoint, this.baseURL);
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				url.searchParams.append(key, value);
			});
		}

		const response = await fetch(url.toString());
		if (!response.ok) {
			throw new Error(`API request failed: ${response.statusText}`);
		}

		return response.json();
	}

	async post<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
		const url = new URL(endpoint, this.baseURL);
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				url.searchParams.append(key, value);
			});
		}

		const response = await fetch(url.toString(), {
			method: 'POST'
		});

		if (!response.ok) {
			throw new Error(`API request failed: ${response.statusText}`);
		}

		return response.json();
	}
}

// Create API client instances
export const backendAPI = new APIClient(config.api.baseURL);
export const currencyAPI = new APIClient(config.api.currencyURL);

/**
 * Helper to handle API errors gracefully
 */
export function handleAPIError(error: unknown, defaultMessage = 'An error occurred'): string {
	if (error instanceof Error) {
		return error.message;
	}
	return defaultMessage;
}

/**
 * Retry logic for failed API requests
 */
export async function retryRequest<T>(
	fn: () => Promise<T>,
	retries = 3,
	delay = 1000
): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		if (retries === 0) throw error;
		await new Promise((resolve) => setTimeout(resolve, delay));
		return retryRequest(fn, retries - 1, delay * 2);
	}
}

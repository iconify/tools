import { apiCacheKey, getAPICache, storeAPICache } from './cache';
import type { APICacheOptions, APIQueryParams, APIQueryResult } from './types';
import { axiosConfig, fetchCallbacks } from './config';
import { getFetch } from './fetch.js';

/**
 * Send API query
 */
export async function sendAPIQuery(
	query: APIQueryParams,
	cache?: APICacheOptions
): Promise<APIQueryResult> {
	const cacheKey = cache ? apiCacheKey(query) : '';
	if (cache) {
		const cached = await getAPICache(cache.dir, cacheKey);
		if (cached) {
			return { success: true, content: cached };
		}
	}
	const response = await sendQuery(query);
	if (cache && response.success) {
		try {
			await storeAPICache(cache, cacheKey, response.content);
		} catch {
			console.error('Error writing API cache');
		}
	}
	return response;
}

/**
 * Send query
 */
async function sendQuery(query: APIQueryParams): Promise<APIQueryResult> {
	const params = query.params ? query.params.toString() : '';
	const url = query.uri + (params ? '?' + params : '');
	const headers = query.headers;

	fetchCallbacks.onStart?.(url, query);

	function fail(response?: Response, status?: number): APIQueryResult {
		fetchCallbacks.onError?.(url, query, status);
		return {
			success: false,
			response,
			error: status ?? 404,
		};
	}

	const fetch = getFetch();
	try {
		const response = await fetch(url, {
			...axiosConfig,
			headers,
		});

		if (response.status !== 200) {
			return fail(response, response.status);
		}

		const data = await response.text();
		if (typeof data !== 'string') {
			return fail(response);
		}

		fetchCallbacks.onSuccess?.(url, query);

		return {
			success: true,
			content: data,
		};
	} catch {
		return fail();
	}
}

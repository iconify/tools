import crossFetch from 'cross-fetch';
import { apiCacheKey, getAPICache, storeAPICache } from './cache';
import type { APICacheOptions, APIQueryParams } from './types';

/**
 * Send API query
 */
export async function sendAPIQuery(
	query: APIQueryParams,
	cache?: APICacheOptions
): Promise<number | string> {
	const cacheKey = cache ? apiCacheKey(query) : '';
	if (cache) {
		const cached = await getAPICache(cache.dir, cacheKey);
		if (cached) {
			return cached;
		}
	}
	const result = await sendQuery(query);
	if (cache && typeof result !== 'number') {
		try {
			await storeAPICache(cache, cacheKey, result);
		} catch (err) {
			console.error('Error writing API cache');
		}
	}
	return result;
}

/**
 * Send query
 */
async function sendQuery(query: APIQueryParams): Promise<number | string> {
	const params = query.params ? query.params.toString() : '';
	const url = query.uri + (params ? '?' + params : '');
	console.log('Fetch:', url);
	const headers = query.headers;
	try {
		const response = await crossFetch(url, {
			headers,
		});
		if (response.status >= 400) {
			return response.status;
		}

		return await response.text();
	} catch (err) {
		return 404;
	}
}

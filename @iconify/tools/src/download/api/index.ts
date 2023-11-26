import axios from 'axios';
import { apiCacheKey, getAPICache, storeAPICache } from './cache';
import type { APICacheOptions, APIQueryParams } from './types';
import { axiosConfig } from './config';

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
		const response = await axios.get(url, {
			...axiosConfig,
			headers,
			responseType: 'text',
		});

		if (response.status !== 200) {
			return response.status;
		}
		if (typeof response.data !== 'string') {
			return 404;
		}

		return response.data;
	} catch (err) {
		return 404;
	}
}

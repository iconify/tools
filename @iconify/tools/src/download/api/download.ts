import { writeFile } from 'fs/promises';
import type { APIQueryParams } from './types';
import { axiosConfig, fetchCallbacks } from './config';
import { getFetch } from './fetch.js';

/**
 * Download file
 */
export async function downloadFile(
	query: APIQueryParams,
	target: string
): Promise<void> {
	const params = query.params ? query.params.toString() : '';
	const url = query.uri + (params ? '?' + params : '');
	const headers = query.headers;

	fetchCallbacks.onStart?.(url, query);
	const fetch = getFetch();
	const response = await fetch(url, {
		...axiosConfig,
		headers,
	});

	if (response.status !== 200) {
		fetchCallbacks.onError?.(url, query, response.status);
		throw new Error(`Error downloading ${url}: ${response.status}`);
	}

	const data = await response.arrayBuffer();
	fetchCallbacks.onSuccess?.(url, query);
	await writeFile(target, Buffer.from(data));
}

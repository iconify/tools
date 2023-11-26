import axios from 'axios';
import { writeFile } from 'fs/promises';
import type { APIQueryParams } from './types';
import { axiosConfig } from './config';

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

	const response = await axios.get(url, {
		...axiosConfig,
		headers,
		responseType: 'arraybuffer',
	});

	if (response.status !== 200) {
		throw new Error(`Error downloading ${url}: ${response.status}`);
	}

	const data = response.data as ArrayBuffer;
	await writeFile(target, Buffer.from(data));
}

import { promisify } from 'util';
import { pipeline } from 'stream';
import { writeFile } from 'fs/promises';
import type { APIQueryParams } from './types';

const streamPipeline = promisify(pipeline);

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

	const response = await fetch(url, {
		headers,
	});

	if (!response.ok || !response.body) {
		throw new Error(`Error downloading ${url}: ${response.status}`);
	}
	const data = await response.arrayBuffer();
	await writeFile(target, Buffer.from(data));
}

import fetch from 'node-fetch';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createWriteStream } from 'fs';
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

	await streamPipeline(response.body, createWriteStream(target));
}

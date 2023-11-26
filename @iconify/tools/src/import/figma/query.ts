import { sendAPIQuery } from '../../download/api';
import {
	apiCacheKey,
	clearAPICache,
	getAPICache,
} from '../../download/api/cache';
import { runConcurrentQueries } from '../../download/api/queue';
import type { APICacheOptions, APIQueryParams } from '../../download/api/types';
import type { DocumentNotModified } from '../../download/types/modified';
import type {
	FigmaAPIError,
	FigmaAPIImagesResponse,
	FigmaDocument,
} from './types/api';
import type {
	FigmaIfModifiedSinceOption,
	FigmaFilesQueryOptions,
	FigmaImagesQueryOptions,
} from './types/options';
import type { FigmaIconNode, FigmaNodesImportResult } from './types/result';

/**
 * Compare last modified dates
 */
function identicalDates(actual: unknown, expected: string | Date): boolean {
	if (typeof actual !== 'string') {
		return false;
	}
	if (actual === expected) {
		return true;
	}
	return new Date(actual).toString() === new Date(expected).toString();
}

/**
 * Get Figma files
 */
export async function figmaFilesQuery<
	T extends FigmaIfModifiedSinceOption & FigmaFilesQueryOptions
>(
	options: T,
	cache?: APICacheOptions
): Promise<FigmaDocument | DocumentNotModified>;
export async function figmaFilesQuery(
	options: FigmaFilesQueryOptions,
	cache?: APICacheOptions
): Promise<FigmaDocument>;
export async function figmaFilesQuery(
	options: FigmaFilesQueryOptions,
	cache?: APICacheOptions
): Promise<FigmaDocument | DocumentNotModified> {
	// Check token
	if (!options.token) {
		throw new Error('Missing Figma API token');
	}

	// Generate parameters
	const params = new URLSearchParams();
	if (options.ids) {
		params.set('ids', options.ids.join(','));
	}
	if (options.version) {
		params.set('version', options.version);
	}
	if (options.depth) {
		params.set('depth', options.depth.toString());
	}
	const queryParams: APIQueryParams = {
		uri: 'https://api.figma.com/v1/files/' + options.file,
		params,
		headers: {
			'X-FIGMA-TOKEN': options.token,
		},
	};

	// Get latest version without cache if 'ifModifiedSince' is set
	const isModified = async (): Promise<boolean> => {
		// Check cache
		if (!cache || !options.ifModifiedSince) {
			return true;
		}

		const cacheKey = apiCacheKey(queryParams);
		const cachedData = await getAPICache(cache.dir, cacheKey);
		if (!cachedData) {
			return true;
		}

		// Get time stamp for comparison
		let ifModifiedSince: string | Date;
		if (options.ifModifiedSince === true) {
			try {
				const parsedData = JSON.parse(cachedData) as FigmaDocument;
				if (typeof parsedData.lastModified !== 'string') {
					// Bad data
					await clearAPICache(cache.dir);
					return true;
				}
				// Set ifModifiedSince to last cached time
				ifModifiedSince = parsedData.lastModified;
			} catch (err) {
				// Bad data
				await clearAPICache(cache.dir);
				return true;
			}
		} else {
			ifModifiedSince = options.ifModifiedSince;
		}

		// Get shallow copy of tree to get last modification time
		const versionCheckParams = {
			...queryParams,
			params: new URLSearchParams(params),
		};
		versionCheckParams.params.set('depth', '1');
		const data = await sendAPIQuery(versionCheckParams);
		try {
			if (typeof data === 'string') {
				const parsedData = JSON.parse(data) as FigmaDocument;
				if (identicalDates(parsedData.lastModified, ifModifiedSince)) {
					return false;
				}
			}
		} catch (err) {
			//
		}

		// Reset cache
		await clearAPICache(cache.dir);
		return true;
	};
	if (!(await isModified())) {
		return 'not_modified';
	}

	// Send query
	const data = await sendAPIQuery(queryParams, cache);
	if (typeof data === 'number') {
		throw new Error(`Error retrieving document from API: ${data}`);
	}

	// Parse JSON
	let parsedData: Record<string, unknown>;
	try {
		parsedData = JSON.parse(data) as Record<string, unknown>;
	} catch (err) {
		throw new Error(`Error retrieving document from API: invalid data`);
	}
	if (typeof parsedData.status === 'number') {
		// Error
		const figmaError = parsedData as unknown as FigmaAPIError;
		throw new Error(
			`Error retrieving document from API: ${figmaError.err}`
		);
	}

	const document = parsedData as unknown as FigmaDocument;
	if (document.editorType !== 'figma') {
		throw new Error(
			`Error retrieving document from API: document is for ${document.editorType}`
		);
	}

	// Check if document was modified
	if (identicalDates(options.ifModifiedSince, document.lastModified)) {
		return 'not_modified';
	}

	return document;
}

/**
 * Generate all images
 */
export async function figmaImagesQuery(
	options: FigmaImagesQueryOptions,
	nodes: FigmaNodesImportResult,
	cache?: APICacheOptions
): Promise<FigmaNodesImportResult> {
	const uri = 'https://api.figma.com/v1/images/' + options.file;
	const maxLength = 2048 - uri.length;
	const svgOptions = options.svgOptions || {};

	let lastError: number | undefined;
	let found = 0;

	// Send query
	const query = (ids: string[]): Promise<FigmaAPIImagesResponse> => {
		return new Promise((resolve, reject) => {
			const params = new URLSearchParams({
				ids: ids.join(','),
				format: 'svg',
			});
			if (options.version) {
				params.set('version', options.version);
			}
			if (svgOptions.includeID) {
				params.set('svg_include_id', 'true');
			}
			if (svgOptions.simplifyStroke) {
				params.set('svg_simplify_stroke', 'true');
			}
			if (svgOptions.useAbsoluteBounds) {
				params.set('use_absolute_bounds', 'true');
			}

			sendAPIQuery(
				{
					uri,
					params,
					headers: {
						'X-FIGMA-TOKEN': options.token,
					},
				},
				cache
			)
				.then((data) => {
					if (typeof data === 'number') {
						reject(data);
						return;
					}

					let parsedData: FigmaAPIImagesResponse;
					try {
						parsedData = JSON.parse(data) as FigmaAPIImagesResponse;
					} catch {
						reject('Bad API response');
						return;
					}

					resolve(parsedData);
				})
				.catch(reject);
		});
	};

	// Generate queue
	let ids: string[] = [];
	let idsLength = 0;
	const allKeys = Object.keys(nodes.icons);
	const queue: string[][] = [];
	for (let i = 0; i < allKeys.length; i++) {
		const id = allKeys[i];
		ids.push(id);
		idsLength += id.length + 1;
		if (idsLength >= maxLength) {
			queue.push(ids.slice(0));
			ids = [];
			idsLength = 0;
		}
	}
	if (idsLength) {
		queue.push(ids.slice(0));
	}

	// Get data
	const results = await runConcurrentQueries(queue.length, (index) =>
		query(queue[index])
	);

	// Parse data
	results.forEach((data) => {
		const images = data.images;
		for (const id in images) {
			const node = nodes.icons[id];
			const target = images[id];
			if (node && target) {
				node.url = target;
				found++;
			}
		}
	});

	// Validate results
	if (!found) {
		if (lastError) {
			throw new Error(
				`Error retrieving image data from API${
					lastError ? ': ' + lastError.toString() : ''
				}`
			);
		} else {
			throw new Error('No valid icon layers were found');
		}
	}
	nodes.generatedIconsCount = found;
	return nodes;
}

/**
 * Download all images
 */
export async function figmaDownloadImages(
	nodes: FigmaNodesImportResult,
	cache?: APICacheOptions
): Promise<FigmaNodesImportResult> {
	const icons = nodes.icons;
	const ids = Object.keys(icons);
	let count = 0;

	// Filter data
	interface FigmaIconNodeWithURL extends FigmaIconNode {
		url: string;
	}
	const filtered = Object.create(null) as Record<
		string,
		FigmaIconNodeWithURL
	>;
	for (let i = 0; i < ids.length; i++) {
		const id = ids[i];
		const item = icons[id];
		if (item.url) {
			filtered[id] = item as FigmaIconNodeWithURL;
		}
	}
	const keys = Object.keys(filtered);

	// Download everything
	await runConcurrentQueries(keys.length, (index) => {
		return new Promise((resolve, reject) => {
			const id = keys[index];
			const item = filtered[id];
			sendAPIQuery(
				{
					uri: item.url,
				},
				cache
			)
				.then((data) => {
					if (typeof data === 'string') {
						count++;
						item.content = data;
						resolve(true);
					} else {
						reject(data);
					}
				})
				.catch(reject);
		});
	});

	// Make sure something was downloaded
	if (!count) {
		throw new Error('Error retrieving images');
	}

	// Update counter and return node
	nodes.downloadedIconsCount = count;
	return nodes;
}

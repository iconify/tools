import { sendAPIQuery } from '../../api';
import { apiCacheKey, clearAPICache, getAPICache } from '../../api/cache';
import type { APICacheOptions, APIQueryParams } from '../../api/types';
import type {
	FigmaAPIError,
	FigmaAPIImagesResponse,
	FigmaDocument,
} from './types/api';
import type {
	FigmaFilesQueryOptions,
	FigmaImagesQueryOptions,
} from './types/options';
import type {
	FigmaDocumentNotModified,
	FigmaNodesImportResult,
} from './types/result';

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
export async function figmaFilesQuery(
	options: FigmaFilesQueryOptions,
	cache?: APICacheOptions
): Promise<FigmaDocument | FigmaDocumentNotModified> {
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
		params.set('depth', options.depth + '');
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
		parsedData = JSON.parse(data);
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

	let ids: string[] = [];
	let idsLength = 0;
	let lastError: number | undefined;
	let found = 0;

	// Send query
	const query = async () => {
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

		const data = await sendAPIQuery(
			{
				uri,
				params,
				headers: {
					'X-FIGMA-TOKEN': options.token,
				},
			},
			cache
		);
		if (typeof data === 'number') {
			lastError = data;
			return;
		}
		try {
			const parsedData = JSON.parse(data) as FigmaAPIImagesResponse;
			const images = parsedData.images;
			for (const id in images) {
				const node = nodes.icons[id];
				const target = images[id];
				if (node && target) {
					node.url = target;
					found++;
				}
			}
		} catch (err) {
			return;
		}
	};

	// Loop all ids
	const allKeys = Object.keys(nodes.icons);
	for (let i = 0; i < allKeys.length; i++) {
		const id = allKeys[i];
		ids.push(id);
		idsLength += id.length + 1;
		if (idsLength >= maxLength) {
			await query();
			ids = [];
			idsLength = 0;
		}
	}
	if (idsLength) {
		await query();
	}

	// Check data
	if (!found) {
		if (lastError) {
			throw new Error(
				`Error retrieving image data from API${
					lastError ? ': ' + lastError : ''
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
	let lastError: number | undefined;

	for (let i = 0; i < ids.length; i++) {
		const id = ids[i];
		const item = icons[id];
		if (!item.url) {
			continue;
		}
		const result = await sendAPIQuery(
			{
				uri: item.url,
			},
			cache
		);
		if (typeof result === 'number') {
			lastError = result;
			continue;
		}
		if (typeof result === 'string') {
			count++;
			item.content = result;
		}
	}

	if (!count) {
		throw new Error(
			`Error retrieving images${lastError ? ': ' + lastError : ''}`
		);
	}
	nodes.downloadedIconsCount = count;
	return nodes;
}

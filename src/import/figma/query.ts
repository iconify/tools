import { sendAPIQuery } from '../../api';
import type { APICacheOptions } from '../../api/types';
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
 * Get Figma files
 */
export async function figmaFilesQuery(
	options: FigmaFilesQueryOptions,
	cache?: APICacheOptions
): Promise<FigmaDocument | FigmaDocumentNotModified> {
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

	const data = await sendAPIQuery(
		{
			uri: 'https://api.figma.com/v1/files/' + options.file,
			params,
			headers: {
				'X-FIGMA-TOKEN': options.token,
			},
		},
		cache
	);
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
	if (
		options.ifModifiedSince &&
		document.lastModified === options.ifModifiedSince
	) {
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
		throw new Error(
			`Error retrieving image data from API${
				lastError ? ': ' + lastError : ''
			}`
		);
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

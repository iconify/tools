import type { APICacheOptions } from '../../api/types';
import { getFigmaIconNodes } from './nodes';
import {
	figmaDownloadImages,
	figmaFilesQuery,
	figmaImagesQuery,
} from './query';
import type { FigmaImportOptions } from './types/options';
import type {
	FigmaDocumentNotModified,
	FigmaImportResult,
} from './types/result';

/**
 * Import icon set from Figma
 */
export async function importFromFigma(
	options: FigmaImportOptions
): Promise<FigmaImportResult | FigmaDocumentNotModified> {
	const cacheOptions: APICacheOptions | undefined = options.cacheDir
		? {
				// 24 hours
				ttl: options.cacheAPITTL || 60 * 60 * 24,
				dir: options.cacheDir,
		  }
		: void 0;

	const cacheSVGOptions: APICacheOptions | undefined = options.cacheDir
		? {
				// 30 days
				ttl: options.cacheSVGTTL || 60 * 60 * 24 * 30,
				dir: options.cacheDir,
		  }
		: void 0;

	// Get document
	const document = await figmaFilesQuery(options, cacheOptions);
	if (document === 'not_modified') {
		return document;
	}

	// Get nodes
	const nodes = await getFigmaIconNodes(document, options);
	console.log('Nodes found:', nodes.nodesCount);

	// Get images
	await figmaImagesQuery(options, nodes, cacheOptions);
	console.log('Icons generated:', nodes.generatedIconsCount);

	// Download images
	await figmaDownloadImages(nodes, cacheSVGOptions);
	console.log('Icons downloaded:', nodes.downloadedIconsCount);

	// Generate result
	const result: FigmaImportResult = {
		// Document
		name: document.name,
		version: document.version,
		lastModified: document.lastModified,

		// Counters
		nodesCount: nodes.nodesCount as number,
		generatedIconsCount: nodes.generatedIconsCount as number,
		downloadedIconsCount: nodes.downloadedIconsCount as number,
	};
	return result;
}

import type { APICacheOptions } from '../../download/api/types';
import { blankIconSet } from '../../icon-set';
import type { DocumentNotModified } from '../../download/types/modified';
import { SVG } from '../../svg';
import { cleanupSVG } from '../../svg/cleanup';
import { getFigmaIconNodes } from './nodes';
import {
	figmaDownloadImages,
	figmaFilesQuery,
	figmaImagesQuery,
} from './query';
import type {
	FigmaImportOptions,
	FigmaIfModifiedSinceOption,
	FigmaFilesQueryOptions,
} from './types/options';
import type { FigmaIconNode, FigmaImportResult } from './types/result';

/**
 * Import icon set from Figma
 */
export async function importFromFigma<
	T extends FigmaIfModifiedSinceOption & FigmaImportOptions
>(options: T): Promise<FigmaImportResult | DocumentNotModified>;
export async function importFromFigma(
	options: FigmaImportOptions
): Promise<FigmaImportResult>;
export async function importFromFigma(
	options: FigmaImportOptions
): Promise<FigmaImportResult | DocumentNotModified> {
	const cacheOptions: APICacheOptions | undefined = options.cacheDir
		? {
				// 24 hours
				ttl: options.cacheAPITTL || 60 * 60 * 24,
				dir: options.cacheDir,
		  }
		: undefined;

	const cacheSVGOptions: APICacheOptions | undefined = options.cacheDir
		? {
				// 30 days
				ttl: options.cacheSVGTTL || 60 * 60 * 24 * 30,
				dir: options.cacheDir,
		  }
		: undefined;

	// Get document
	const document = await figmaFilesQuery(
		options as FigmaFilesQueryOptions & FigmaIfModifiedSinceOption,
		cacheOptions
	);
	if (document === 'not_modified') {
		return document;
	}

	// Set version to make sure further queries get consistent data
	options.version = document.version;

	// Get nodes
	const nodes = getFigmaIconNodes(document, options);

	// Get images
	await figmaImagesQuery(options, nodes, cacheOptions);

	// Download images
	await figmaDownloadImages(nodes, cacheSVGOptions);

	// Generate icon set
	const iconSet = blankIconSet(options.prefix);
	const icons = nodes.icons;
	const missing: FigmaIconNode[] = [];
	const iconIDs = Object.keys(icons);
	for (let i = 0; i < iconIDs.length; i++) {
		const id = iconIDs[i];
		const item = icons[id];
		if (typeof item.content !== 'string') {
			missing.push(item);
			continue;
		}

		// Callback before import (to change stuff, such as icon content)
		if (options.beforeImportingIcon) {
			const callbackResult = options.beforeImportingIcon(item, iconSet);
			if (callbackResult instanceof Promise) {
				await callbackResult;
			}
		}

		// Import SVG
		try {
			const svg = new SVG(item.content);
			cleanupSVG(svg);
			iconSet.fromSVG(item.keyword, svg);
		} catch (err) {
			missing.push(item);
			continue;
		}

		// Callback after import (to add stuff, such as categories)
		if (options.afterImportingIcon) {
			const callbackResult = options.afterImportingIcon(item, iconSet);
			if (callbackResult instanceof Promise) {
				await callbackResult;
			}
		}
	}

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

		// Icon set
		iconSet,
		missing,
	};
	return result;
}

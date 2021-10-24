import type {
	FigmaImportNodeFilter,
	FigmaImportParentNodeFilter,
} from './nodes';

/**
 * Options for importing SVG
 */
export interface FigmaImportSVGOptions {
	// Whether to include id attributes for all SVG elements. Default: false.
	includeID?: boolean;

	// Whether to simplify inside/outside strokes and use stroke attribute if possible instead of <mask>. Default: true.
	simplifyStroke?: boolean;

	// Use the full dimensions of the node regardless of whether or not it is cropped or the space around it is empty. Use this to export text nodes without cropping. Default: false.
	useAbsoluteBounds?: boolean;
}

/**
 * Options
 */
interface FigmaImportCommonOptions {
	// Figma API token, required
	token: string;

	// Document
	file: string;

	// Document version
	version?: string;
}

// Options for figmaFilesQuery()
export interface FigmaFilesQueryOptions extends FigmaImportCommonOptions {
	// Check if modified since last change
	ifModifiedSince?: string;

	// IDs to check
	ids?: string[];

	// Nodes depth. Set it to avoid retrieving too much data
	// If icons are stored as children nodes of page, set value to 2 (Page -> Icon)
	// If icons are stored in groups on page, set value to 3 (Page -> Group or Frame -> Icon)
	depth?: number;
}

// Options for figmaImagesQuery()
export interface FigmaImagesQueryOptions extends FigmaImportCommonOptions {
	// Figma export options
	svgOptions?: FigmaImportSVGOptions;
}

// Options for getFigmaIconNodes()
export interface FigmaGetIconNodesOptions {
	// Page names or ids, alternative to filterParentNode()
	pages?: string[];

	// Callback to filter parent node, optional. Can be used to stop traversing parts of tree that are irrelevant.
	filterParentNode?: FigmaImportParentNodeFilter;

	// Callback to filter icon node
	iconNameForNode: FigmaImportNodeFilter;
}

/**
 * Options for main import function
 */
export interface FigmaImportOptions
	extends FigmaFilesQueryOptions,
		FigmaImagesQueryOptions,
		FigmaGetIconNodesOptions {
	// Icon set prefix
	prefix: string;

	// Cache directory
	cacheDir?: string;

	// TTL for cache for API queries, in seconds. Default is 3 days
	cacheAPITTL?: number;

	// TTL for cache for SVG, in seconds (icons do not need re-downloading). Default is 30 days
	cacheSVGTTL?: number;
}

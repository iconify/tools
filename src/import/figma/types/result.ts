/**
 * Document wasn't modified
 */
export type FigmaDocumentNotModified = 'not_modified';

/**
 * Result for found icons
 */
export interface FigmaIconNode {
	// Node id
	id: string;
	// Node name
	name: string;
	// Keyword
	keyword: string;
	// URL to download from
	url?: string;
	// Downloaded SVG
	content?: string;
}

/**
 * Nodes count
 */
export interface FigmaNodesCount {
	// Number of nodes marked as icons
	nodesCount: number;
	// Number of generated icons
	generatedIconsCount: number;
	// Number of downloaded icons
	downloadedIconsCount: number;
}

/**
 * Import result for icons
 */
export interface FigmaNodesImportResult extends Partial<FigmaNodesCount> {
	// Icons
	icons: Record<string, FigmaIconNode>;
}

/**
 * Import result
 */
export interface FigmaImportResult extends FigmaNodesCount {
	// Document
	name: string;
	version: string;
	lastModified: string;
}

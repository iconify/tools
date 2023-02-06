import type { FigmaDocument, IconFigmaNode } from './api';
import type { FigmaIconNode, FigmaNodesImportResult } from './result';

// Node types that can be parent nodes
// 'CANVAS' in API is equal to 'PAGE' in plugins
export type FigmaImportParentNodeType =
	| 'CANVAS'
	| 'FRAME'
	| 'GROUP'
	| 'SECTION';

// Node types that can be icons
export type FigmaImportIconNodeType = IconFigmaNode['type'];

/**
 * Node information passed to callback
 */
export interface FigmaParentNodeData {
	id: string;
	type: FigmaImportParentNodeType;
	name: string;
}

export interface FigmaImportNodeData {
	id: string;
	type: FigmaImportIconNodeType;
	name: string;
	width: number;
	height: number;
	// First item is document
	parents: FigmaParentNodeData[];
}

/**
 * Callback to check if node needs to be checked for icons
 *
 * Used to speed up processing by eleminating pages, frames and groups that do not need processing
 */
export type FigmaImportParentNodeFilter = (
	// Nodes tree, first item is page, last item is node being checked
	node: FigmaParentNodeData[],
	// Figma document, raw response from Figma API
	document: FigmaDocument
) => boolean;

/**
 * Check if node is an icon.
 *
 * Returns icon name on success, null or undefined if not should be ignored.
 * Function can also return FigmaIconNode object, where it can put extra properties that can be used later
 */
// FigmaIconNode with 'keyword' property being mandatory, other properties being optional
type FigmaIconNodeWithKeyword = Partial<FigmaIconNode> &
	Pick<FigmaIconNode, 'keyword'>;

export type FigmaImportNodeFilter = (
	// Node to check
	node: FigmaImportNodeData,
	// Other nodes that were already found (can be used to check for duplicate keywords)
	nodes: FigmaNodesImportResult,
	// Figma document, raw response from Figma API
	document: FigmaDocument
) => string | FigmaIconNodeWithKeyword | null | undefined;

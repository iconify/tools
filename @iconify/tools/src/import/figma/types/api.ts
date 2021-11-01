/**
 * Basic document structure
 */
// Various types for items
// interface FigmaColor {
// 	r: number;
// 	g: number;
// 	b: number;
// 	a: number;
// }

interface FigmaBoundingBox {
	x: number;
	y: number;
	width: number;
	height: number;
}

// Base node: common elements for all nodes
interface BaseFigmaNode {
	id: string;
	name: string;
}

// Generic node for irrelevant node types, might contain children
interface GenericFigmaNode extends BaseFigmaNode {
	type: string;
	children?: FigmaNode[];
}

// Frame or component: node that contains icon
export interface IconFigmaNode extends BaseFigmaNode {
	type: 'FRAME' | 'COMPONENT' | 'INSTANCE';
	clipsContent?: boolean;
	absoluteBoundingBox?: FigmaBoundingBox;
	children: FigmaNode[];
}

// Document node
export interface FigmaDocumentNode extends BaseFigmaNode {
	type: 'DOCUMENT';
	children: FigmaNode[];
}

// Node that can be a child of document node
export type FigmaNode = GenericFigmaNode | IconFigmaNode;

/**
 * Document response from API
 */
export interface FigmaDocument {
	document: FigmaDocumentNode;
	name: string;
	version: string;
	lastModified: string;
	thumbnailUrl: string;
	role: string;
	editorType: 'figma' | 'figjam';
}

export interface FigmaAPIError {
	status: number;
	err: string;
}

/**
 * Result for retrieved icons
 */
export interface FigmaAPIImagesResponse {
	err?: string | null;
	images: Record<string, string | null>;
}

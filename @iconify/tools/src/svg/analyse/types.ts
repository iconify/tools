import * as cheerio from 'cheerio';

/**
 * Options
 */
export interface AnalyseSVGStructureOptions {
	// Attempt to fix errors instead of throwing exception
	fixErrors?: boolean;
}

/**
 * Extended properties for element
 */

/**
 * Link to element
 */
export interface LinkToElementWithID {
	// ID of element
	id: string;

	// Used as mask (or clip path) or paint?
	usedAsMask: boolean;

	// Index of element that references it
	usedByIndex: number;
}

/**
 * How element is used by parent elements
 */
export interface ExtendedTagElementUses {
	// Element is used as a mask or child element of mask (or clip path) - uses grayscale palette
	_usedAsMask: boolean;

	// Element is used as paint - uses palette
	_usedAsPaint: boolean;
}

/**
 * Definition: mask, clip path, symbol, etc...
 */
interface ReusableElement {
	id: string;
	isMask: boolean;
	index: number;
}

/**
 * Element with id
 *
 * Similar to ReusableElement, but not necessary a definition - any element with id. Also contains list of child elements
 */
export interface ElementWithID {
	// ID of element
	id: string;

	// Is it a mask (or clip path)?
	isMask: boolean;

	// Indexes of element and all children
	indexes: Set<number>;
}

/**
 * Parent and child elements. Unlike standard tree, this tree is for elements that inherit attributes from parent element
 */
interface ExtendedTagElementRelations {
	// Parent element
	_parentElement?: number;

	// Children
	_childElements?: number[];
}

/**
 * Extended tag
 */
export interface ExtendedTagElement
	extends cheerio.Element,
		ExtendedTagElementUses,
		ExtendedTagElementRelations {
	// Node index
	_index: number;

	// ID of element
	_id?: string;

	// Elements with IDs this element belongs to
	_belongsTo?: ElementWithID[];

	// Data for reusable element, this element belongs to
	_reusableElement?: ReusableElement;

	// Links
	_linksTo?: LinkToElementWithID[];
}

/**
 * Additional stuff for <svg>
 */
export interface ExtendedRootTagElement extends ExtendedTagElement {
	_parsed?: boolean;
}

/**
 * Tree
 */
export interface ElementsTreeItem {
	index: number;
	usedAsMask: boolean;
	parent?: ElementsTreeItem;
	children: ElementsTreeItem[];
}

/**
 * Elements map
 */
export type ElementsMap = Map<number, ExtendedTagElement>;

/**
 * Result
 */
export interface AnalyseSVGStructureResult {
	// List of all elements
	elements: ElementsMap;

	// List of found IDs
	ids: Record<string, number>;

	// List of links
	links: LinkToElementWithID[];

	// Tree, starting with SVG element
	tree: ElementsTreeItem;
}

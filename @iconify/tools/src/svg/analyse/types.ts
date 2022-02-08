/**
 * Extended properties for element
 */
export interface ElementWithID {
	id: string; // ID of element
	isMask: boolean; // Is it a mask (or clip path)?
	indexes: Set<number>; // Indexes of element and all children
}

export interface LinkToElementWithID {
	id: string; // ID of element
	usedAsMask: boolean; // Used as mask (or clip path) or paint?
	usedByIndex: number; // Index of element that references it
}

export interface ExtendedTagElementUses {
	// Element is used as a mask or child element of mask (or clip path) - uses grayscale palette
	_usedAsMask: boolean;

	// Element is used as paint - uses palette
	_usedAsPaint: boolean;
}

interface ReusableElement {
	id: string;
	isMask: boolean;
	index: number;
}

export interface ExtendedTagElement
	extends cheerio.TagElement,
		ExtendedTagElementUses {
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
 * Result
 */
export interface AnalyseSVGStructureResult {
	// List of all elements
	elements: Map<number, ExtendedTagElement>;

	// List of found IDs
	ids: Record<string, number>;

	// List of links
	links: LinkToElementWithID[];
}

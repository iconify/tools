/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { SVG } from './index';
import { parseSVG } from './parse';
import type { ParseSVGCallbackItem } from './parse';
import type {
	AnalyseSVGStructureResult,
	ExtendedRootTagElement,
	ExtendedTagElement,
	LinkToElementWithID,
	ElementsTreeItem,
	AnalyseSVGStructureOptions,
} from './analyse/types';
import {
	commonColorPresentationalAttributes,
	markerAttributes,
	tagSpecificNonPresentationalAttributes,
	urlPresentationalAttributes,
} from './data/attributes';
import {
	defsTag,
	maskTags,
	reusableElementsWithPalette,
	styleTag,
	useTag,
} from './data/tags';
import { analyseTagError } from './analyse/error';

/**
 * Find all IDs, links, which elements use palette, which items aren't used
 *
 * Before running this function run cleanup functions to change inline style to attributes and fix attributes
 */
export async function analyseSVGStructure(
	svg: SVG,
	options: AnalyseSVGStructureOptions = {}
): Promise<AnalyseSVGStructureResult> {
	// Options
	const fixErrors = options.fixErrors;

	// Root element
	let root = svg.$svg(':root').get(0) as ExtendedRootTagElement;
	if (root._parsed) {
		// Reload to reset custom properties
		svg.load(svg.toString());
		root = svg.$svg(':root').get(0);
	}
	root._parsed = true;
	const cheerio = svg.$svg;

	// List of all elements
	const elements: AnalyseSVGStructureResult['elements'] = new Map();

	// List of IDs
	const ids: AnalyseSVGStructureResult['ids'] = Object.create(null);

	// Links
	let links: AnalyseSVGStructureResult['links'] = [];

	/**
	 * Found element with id
	 */
	function addID(element: ExtendedTagElement, id: string) {
		if (ids[id] !== void 0) {
			throw new Error(`Duplicate id "${id}"`);
		}
		element._id = id;
		ids[id] = element._index;
		return true;
	}

	/**
	 * Add _belongsTo
	 */
	function gotElementWithID(
		element: ExtendedTagElement,
		id: string,
		isMask: boolean
	) {
		addID(element, id);
		if (!element._belongsTo) {
			element._belongsTo = [];
		}
		element._belongsTo.push({
			id,
			isMask,
			indexes: new Set([element._index]),
		});
		return;
	}

	/**
	 * Mark element as reusable, set properties
	 */
	function gotReusableElement(
		item: ParseSVGCallbackItem,
		isMask: boolean
	): boolean {
		const element = item.element as ExtendedTagElement;
		const attribs = element.attribs;
		const index = element._index;

		const id = attribs['id'];
		if (typeof id !== 'string') {
			const message = `Definition element ${analyseTagError(
				element
			)} does not have id`;
			if (fixErrors) {
				item.removeNode = true;
				item.testChildren = false;
				console.warn(message);
				return false;
			}
			throw new Error(message);
		}

		if (ids[id] !== void 0 && fixErrors) {
			console.warn(`Duplicate id "${id}"`);
			item.removeNode = true;
			item.testChildren = false;
			return false;
		}

		element._reusableElement = {
			id,
			isMask,
			index,
		};
		gotElementWithID(element, id, isMask);
		return true;
	}

	/**
	 * Found element that uses another element
	 */
	function gotElementReference(
		item: ParseSVGCallbackItem,
		id: string,
		usedAsMask: boolean
	) {
		const element = item.element as ExtendedTagElement;
		const usedByIndex = element._index;

		const link: LinkToElementWithID = {
			id,
			usedByIndex,
			usedAsMask,
		};

		// Add to global list
		links.push(link);

		// Add to element and parent elements
		if (!element._linksTo) {
			element._linksTo = [];
		}
		element._linksTo.push(link);
	}

	// Find all reusable elements and all usages
	let index = 0;
	await parseSVG(svg, (item) => {
		const { tagName, parents } = item;
		if (styleTag.has(tagName)) {
			item.testChildren = false;
			return;
		}

		const element = item.element as ExtendedTagElement;
		const attribs = element.attribs;

		// Set index
		index++;
		element._index = index;
		elements.set(index, element);

		if (!parents.length) {
			// root <svg>
			element._usedAsMask = false;
			element._usedAsPaint = true;
			return;
		}
		element._usedAsMask = false;
		element._usedAsPaint = false;

		// Get parent element
		const parentItem = parents[0];
		const parentElement = parentItem.element as ExtendedTagElement;

		// Check for mask or clip path
		if (maskTags.has(tagName)) {
			// Element can only be used as mask or clip path
			if (!gotReusableElement(item, true)) {
				return;
			}
		} else if (reusableElementsWithPalette.has(tagName)) {
			// Reusable element that uses palette
			if (!gotReusableElement(item, false)) {
				return;
			}
		} else if (defsTag.has(parentItem.tagName)) {
			// Symbol without <symbol> tag
			if (!gotReusableElement(item, false)) {
				return;
			}
		} else if (!defsTag.has(tagName)) {
			// Not reusable element, not <defs>. Copy parent stuff
			element._usedAsMask = parentElement._usedAsMask;
			element._usedAsPaint = parentElement._usedAsPaint;

			element._parentElement = parentElement._index;
			if (!parentElement._childElements) {
				parentElement._childElements = [];
			}
			parentElement._childElements.push(index);

			// Copy id of reusable element from parent
			const parentReusableElement = parentElement._reusableElement;
			if (parentReusableElement) {
				if (element._reusableElement) {
					// Reusable element inside reusable element: should not happen!
					throw new Error(
						`Reusable element ${analyseTagError(
							element
						)} is inside another reusable element id="${
							parentReusableElement.id
						}"`
					);
				}
				element._reusableElement = parentReusableElement;
			}

			// Copy all parent ids
			const parentBelongsTo = parentElement._belongsTo;
			if (parentBelongsTo) {
				const list = element._belongsTo || (element._belongsTo = []);
				parentBelongsTo.forEach((item) => {
					item.indexes.add(index);
					list.push(item);
				});
			}

			// Check if element has its own id
			if (element._id === void 0) {
				const id = attribs['id'];
				if (typeof id === 'string') {
					gotElementWithID(element, id, false);
				}
			}
		}

		// Check if element uses any ID
		if (tagSpecificNonPresentationalAttributes[tagName]?.has('href')) {
			const href = attribs['href'] || attribs['xlink:href'];
			if (typeof href === 'string') {
				if (href.slice(0, 1) !== '#') {
					throw new Error(
						`Invalid link in ${analyseTagError(element)}`
					);
				}
				const id = href.slice(1);
				gotElementReference(item, id, false);
			}
		}

		// Check colors
		Object.keys(attribs).forEach((attr) => {
			// Get id
			let value = attribs[attr];
			if (value.slice(0, 5).toLowerCase() !== 'url(#') {
				return;
			}
			value = value.slice(5);
			if (value.slice(-1) !== ')') {
				return;
			}
			const id = value.slice(0, value.length - 1).trim();

			if (urlPresentationalAttributes.has(attr)) {
				// Used as mask, clip path or filter
				gotElementReference(item, id, attr !== 'filter');
				return;
			}

			if (
				commonColorPresentationalAttributes.has(attr) ||
				markerAttributes.has(attr)
			) {
				// Used as paint
				gotElementReference(item, id, false);
				return;
			}
		});
	});

	// Make sure all required IDs exist
	links = links.filter((item) => {
		const id = item.id;
		if (ids[id]) {
			return true;
		}

		// Attempt to fix error
		function fix() {
			const index = item.usedByIndex;
			const element = elements.get(index)!;
			const tagName = element.tagName;

			function remove() {
				const $element = cheerio(element);
				const parent = element.parent as ExtendedTagElement;
				if (parent) {
					if (parent._childElements) {
						parent._childElements = parent._childElements.filter(
							(num) => num !== index
						);
					}
					parent._belongsTo?.forEach((list) => {
						list.indexes.delete(index);
					});
				}
				$element.remove();
			}

			// Remove links
			if (element._linksTo) {
				element._linksTo = element._linksTo.filter(
					(item) => item.id !== id
				);
			}

			// Remove <use /> without children
			if (!element.children.length) {
				if (useTag.has(tagName)) {
					remove();
					return;
				}
			}

			// Remove attributes that use id
			const matches = new Set(['#' + id, 'url(#' + id + ')']);
			const attribs = element.attribs;
			for (const attr in attribs) {
				if (matches.has(attribs[attr])) {
					cheerio(element).removeAttr(attr);
				}
			}
		}

		const message = `Missing element with id="${id}"`;
		if (fixErrors) {
			fix();
			console.warn(message);
		} else {
			throw new Error(message);
		}
		return false;
	});

	// Check if tree item already has child item
	function hasChildItem(
		tree: ElementsTreeItem,
		child: ElementsTreeItem,
		canThrow: boolean
	): boolean {
		const item = tree.children.find(
			(item) =>
				item.index === child.index &&
				item.usedAsMask === child.usedAsMask
		);
		if (item && canThrow) {
			throw new Error('Recursion');
		}
		return !!item;
	}

	// Generate tree
	const tree: ElementsTreeItem = {
		index: 1,
		usedAsMask: false,
		children: [],
	};
	function parseTreeItem(
		tree: ElementsTreeItem,
		usedItems: number[],
		inMask: boolean
	) {
		const element = elements.get(tree.index)!;

		// Add usage
		if (tree.usedAsMask || inMask) {
			element._usedAsMask = true;
			inMask = true;
		} else {
			element._usedAsPaint = true;
		}

		usedItems = usedItems.slice(0);
		usedItems.push(element._index);

		// Add all child elements
		element._childElements?.forEach((childIndex) => {
			if (usedItems.indexOf(childIndex) !== -1) {
				throw new Error('Recursion');
			}
			const childItem: ElementsTreeItem = {
				index: childIndex,
				usedAsMask: false,
				children: [],
				parent: tree,
			};
			tree.children.push(childItem);
			parseTreeItem(childItem, usedItems, inMask);
		});

		// Add all links
		element._linksTo?.forEach((link) => {
			const linkIndex = ids[link.id];
			const usedAsMask = link.usedAsMask;
			const childItem: ElementsTreeItem = {
				index: linkIndex,
				usedAsMask,
				children: [],
				parent: tree,
			};
			if (hasChildItem(tree, childItem, false)) {
				return;
			}
			tree.children.push(childItem);
			parseTreeItem(childItem, usedItems, inMask || usedAsMask);
		});
	}
	parseTreeItem(tree, [0], false);

	return {
		elements,
		ids,
		links,
		tree,
	};
}

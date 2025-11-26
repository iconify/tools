import {
	iterateXMLContent,
	type ParsedXMLTagElement,
} from '@cyberalien/svg-utils';
import type { SVG } from './';

/**
 * Item in callback
 */
export interface ParseSVGCallbackItem {
	// Node
	node: ParsedXMLTagElement;

	// SVG instance
	svg: SVG;

	// Parent elements, first item is direct parent, last item is 'svg'
	parents: ParseSVGCallbackItem[];

	// Set to false to stop parsing
	testChildren: boolean;

	// Set to true to remove node
	removeNode: boolean;
}

/**
 * Callback function
 */
export type ParseSVGCallback = (item: ParseSVGCallbackItem) => void;

/**
 * Parse SVG
 *
 * This function finds all elements in SVG and calls callback for each element.
 */
export function parseSVG(svg: SVG, callback: ParseSVGCallback): void {
	const map = new Map<ParsedXMLTagElement, ParseSVGCallbackItem>();
	iterateXMLContent([svg.$svg], (node, stack) => {
		if (node.type !== 'tag') {
			return;
		}

		// Get parent items, make sure check was not aborted
		// Parents are in reverse order: in stack closest parent is last, in item first
		const parents: ParseSVGCallbackItem[] = [];
		for (const parent of stack) {
			const parentItem = map.get(parent)!; // Always exists
			if (!parentItem.testChildren) {
				return 'skip';
			}
			parents.unshift(parentItem!);
		}

		// Create new item
		const item: ParseSVGCallbackItem = {
			svg,
			node,
			parents,
			testChildren: true,
			removeNode: false,
		};
		map.set(node, item);

		// Run callback
		const callbackResult = callback(item);
		if ((callbackResult as unknown) instanceof Promise) {
			// Old code
			throw new Error('parseSVG does not support async callbacks');
		}

		// Check result
		if (item.removeNode) {
			return 'remove';
		}
		if (!item.testChildren) {
			return 'skip';
		}
	});
}

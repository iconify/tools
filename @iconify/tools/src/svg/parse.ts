import type { CheerioElement, WrappedCheerioElement } from '../misc/cheerio';
import type { SVG } from './';
/**
 * Item in callback
 */
export interface ParseSVGCallbackItem {
	tagName: string;
	element: CheerioElement;
	$element: WrappedCheerioElement;
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
	const cheerio = svg.$svg;
	const $root = svg.$svg(':root');

	function checkNode(
		element: CheerioElement,
		parents: ParseSVGCallbackItem[]
	) {
		if (element.type !== 'tag') {
			return;
		}

		const $element = cheerio(element);
		const tagName = element.tagName;
		const item: ParseSVGCallbackItem = {
			tagName,
			element,
			$element,
			svg,
			parents,
			testChildren: true,
			removeNode: false,
		};

		// Run callback
		const callbackResult = callback(item);
		if ((callbackResult as unknown) instanceof Promise) {
			// Old code
			throw new Error('parseSVG does not support async callbacks');
		}

		// Test child nodes
		const newParents = parents.slice(0);
		newParents.unshift(item);

		let queue: CheerioElement[] = [];
		if (tagName !== 'style' && item.testChildren && !item.removeNode) {
			const children = $element.children().toArray();
			queue = children.slice(0);
		}

		while (queue.length) {
			const queueItem = queue.shift();
			if (!queueItem || item.removeNode) {
				// Do not parse child items if item is marked for removal
				break;
			}

			checkNode(queueItem, newParents);
		}

		// Remove node
		if (item.removeNode) {
			$element.remove();
		}
	}

	checkNode($root.get(0) as CheerioElement, []);
}

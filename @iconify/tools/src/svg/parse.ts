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
export type ParseSVGCallback = (
	item: ParseSVGCallbackItem
) => void | Promise<void>;

/**
 * Parse SVG
 *
 * This function finds all elements in SVG and calls callback for each element.
 * Callback can be asynchronous.
 */
export async function parseSVG(
	svg: SVG,
	callback: ParseSVGCallback
): Promise<void> {
	async function checkNode(
		element: cheerio.Element,
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
		const result = callback(item);
		if (result instanceof Promise) {
			await result;
		}

		// Test child nodes
		const newParents = parents.slice(0);
		newParents.unshift(item);
		if (tagName !== 'style' && item.testChildren && !item.removeNode) {
			const children = $element.children().toArray();
			for (let i = 0; i < children.length; i++) {
				await checkNode(children[i], newParents);
			}
		}

		// Remove node
		if (item.removeNode) {
			$element.remove();
		}
	}

	const cheerio = svg.$svg;
	const $root = svg.$svg(':root');
	await checkNode($root.get(0) as cheerio.Element, []);
}

import type { SVG } from './';

/**
 * Shortcuts for Cheerio elements
 */
export type CheerioElement = cheerio.TagElement;
export type WrappedCheerioElement = cheerio.Cheerio;

/**
 * Item in callback
 */
export interface ParseSVGCallbackItem {
	tagName: string;
	element: CheerioElement;
	$element: WrappedCheerioElement;
	svg: SVG;
	parents: ParseSVGCallbackItem[];
	testChildren: boolean;
	removeNode: boolean;
}

/**
 * Callback function
 */
export type ParseSVGCallback = (item: ParseSVGCallbackItem) => void;

/**
 * Parse SVG
 */
export function parseSVG(svg: SVG, callback: ParseSVGCallback): void {
	function checkNode(
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
		callback(item);

		// Test child nodes
		const newParents = parents.slice(0);
		newParents.unshift(item);
		if (item.testChildren && !item.removeNode) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
			$element.children().each((index, child) => {
				checkNode(child, newParents);
			});
		}

		// Remove node
		if (item.removeNode) {
			$element.remove();
		}
	}

	const cheerio = svg.$svg;
	const $root = svg.$svg(':root');
	checkNode($root.get(0), []);
}

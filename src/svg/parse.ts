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
export type ParseSVGCallback = (
	item: ParseSVGCallbackItem
) => void | Promise<void>;

/**
 * Parse SVG
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
		if (item.testChildren && !item.removeNode) {
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
	await checkNode($root.get(0), []);
}

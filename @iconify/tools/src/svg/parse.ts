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
type Callback<T> = (item: ParseSVGCallbackItem) => T;

export type ParseSVGCallback = Callback<void | Promise<void>>;
export type ParseSVGCallbackSync = Callback<void>;

/**
 * Parse, using callback hell to support both sync and async versions
 */
type Next = () => void;
type InternalCallback = (item: ParseSVGCallbackItem, next: Next) => void;
function parse(svg: SVG, callback: InternalCallback, done: Next) {
	function checkNode(
		element: CheerioElement,
		parents: ParseSVGCallbackItem[],
		done: Next
	) {
		if (element.type !== 'tag') {
			return done();
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
		callback(item, () => {
			// Test child nodes
			const newParents = parents.slice(0);
			newParents.unshift(item);

			let queue: CheerioElement[] = [];
			if (tagName !== 'style' && item.testChildren && !item.removeNode) {
				const children = $element.children().toArray();
				queue = children.slice(0);
			}

			const next = () => {
				const queueItem = queue.shift();
				if (!queueItem) {
					// Remove node
					if (item.removeNode) {
						$element.remove();
					}
					return done();
				}

				checkNode(queueItem, newParents, next);
			};
			next();
		});
	}

	const cheerio = svg.$svg;
	const $root = svg.$svg(':root');
	checkNode($root.get(0) as CheerioElement, [], done);
}

/**
 * Parse SVG
 *
 * This function finds all elements in SVG and calls callback for each element.
 * Callback can be asynchronous.
 */
export function parseSVG(svg: SVG, callback: ParseSVGCallback): Promise<void> {
	return new Promise((fulfill, reject) => {
		parse(
			svg,
			(item, next) => {
				const result = callback(item);
				if (result instanceof Promise) {
					result.then(next).catch(reject);
				} else {
					next();
				}
			},
			fulfill
		);
	});
}

/**
 * Sync version
 */
export function parseSVGSync(svg: SVG, callback: ParseSVGCallbackSync): void {
	let isSync = true;
	parse(
		svg,
		(item, next) => {
			callback(item);
			next();
		},
		() => {
			if (!isSync) {
				throw new Error('parseSVGSync callback was async');
			}
		}
	);
	isSync = false;
}

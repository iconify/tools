import type { SVG } from '.';
import { parseInlineStyle } from '../css/parse';
import { tokensToString } from '../css/parser/export';
import { getTokens } from '../css/parser/tokens';
import { tokensTree } from '../css/parser/tree';
import type { CSSRuleToken, CSSToken } from '../css/parser/types';
import { parseSVGSync } from './parse';
import { parseSVG, ParseSVGCallbackItem } from './parse';

/**
 * Item in callback
 */
interface ParseSVGStyleCallbackItemCommon {
	prop: string;
	value: string;
}
interface ParseSVGStyleCallbackItemInline
	extends ParseSVGStyleCallbackItemCommon {
	type: 'inline';
	item: ParseSVGCallbackItem;
}
interface ParseSVGStyleCallbackItemGlobal
	extends ParseSVGStyleCallbackItemCommon {
	type: 'global';
	token: CSSRuleToken;
	selectors: string[];
	selectorTokens: CSSToken[];
	prevTokens: (CSSToken | null)[];
	nextTokens: CSSToken[];
}

export type ParseSVGStyleCallbackItem =
	| ParseSVGStyleCallbackItemInline
	| ParseSVGStyleCallbackItemGlobal;

/**
 * Result: undefined to remove item, string to change/keep item
 */
export type ParseSVGStyleCallbackResult = string | undefined;

/**
 * Callback function
 */
export type ParseSVGStyleCallback = (
	item: ParseSVGStyleCallbackItem
) => ParseSVGStyleCallbackResult | Promise<ParseSVGStyleCallbackResult>;

export type ParseSVGStyleCallbackSync = (
	item: ParseSVGStyleCallbackItem
) => ParseSVGStyleCallbackResult;

/**
 * Internal function with callback hell to support both sync and async code
 */
type Next = () => void;
type CallbackNext = (result: ParseSVGStyleCallbackResult) => void;
type InternalCallback = (
	item: ParseSVGStyleCallbackItem,
	next: CallbackNext
) => void;

function parseItem(
	item: ParseSVGCallbackItem,
	callback: InternalCallback,
	done: Next
) {
	const tagName = item.tagName;
	const $element = item.$element;

	// Parse <style> tag
	function parseStyleItem(done: Next) {
		const content = $element.text();
		if (typeof content !== 'string') {
			$element.remove();
			return done();
		}

		const tokens = getTokens(content);
		if (!(tokens instanceof Array)) {
			// Invalid style
			throw new Error('Error parsing style');
		}

		// Parse all tokens
		let changed = false;
		const selectorStart: number[] = [];
		const newTokens: (CSSToken | null)[] = [];

		// Called when all tokens are parsed
		const parsedTokens = () => {
			if (changed) {
				// Update style
				const tree = tokensTree(
					newTokens.filter((token) => token !== null) as CSSToken[]
				);

				if (!tree.length) {
					// Empty
					$element.remove();
				} else {
					const newContent = tokensToString(tree);
					item.$element.text(newContent);
				}
			}

			done();
		};

		// Parse next token
		const nextToken = (): void => {
			const token = tokens.shift();
			if (token === void 0) {
				return parsedTokens();
			}

			switch (token.type) {
				case 'selector':
				case 'at-rule':
					selectorStart.push(newTokens.length);
					break;

				case 'close':
					selectorStart.pop();
					break;
			}

			if (token.type !== 'rule') {
				newTokens.push(token);
				return nextToken();
			}

			const value = token.value;

			const selectorTokens = selectorStart
				.map((index) => newTokens[index])
				.filter((item) => item !== null) as CSSToken[];

			callback(
				{
					type: 'global',
					prop: token.prop,
					value,
					token,
					selectorTokens,
					selectors: selectorTokens.reduce(
						(prev: string[], current: CSSToken) => {
							switch (current.type) {
								case 'selector': {
									return prev.concat(current.selectors);
								}
							}
							return prev;
						},
						[] as string[]
					),
					prevTokens: newTokens,
					nextTokens: tokens.slice(0),
				},
				(result) => {
					if (result !== void 0) {
						if (result !== value) {
							changed = true;
							token.value = result;
						}
						newTokens.push(token);
					} else {
						// Delete token
						changed = true;
					}

					nextToken();
				}
			);
		};
		nextToken();
	}

	if (tagName === 'style') {
		return parseStyleItem(done);
	}

	// Parse style
	const attribs = item.element.attribs;
	if (attribs.style === void 0) {
		return done();
	}

	const parsedStyle = parseInlineStyle(attribs.style);
	if (parsedStyle === null) {
		// Ignore style
		$element.removeAttr('style');
		return done();
	}

	// List of properties to parse, status
	const propsQueue = Object.keys(parsedStyle);
	let changed = false;

	// Called when all properties are parsed
	const parsedProps = () => {
		if (changed) {
			const newStyle = Object.keys(parsedStyle)
				.map((key) => key + ':' + parsedStyle[key] + ';')
				.join('');
			if (!newStyle.length) {
				$element.removeAttr('style');
			} else {
				$element.attr('style', newStyle);
			}
		}
		done();
	};

	// Parse next property
	const nextProp = (): void => {
		const prop = propsQueue.shift();
		if (prop === void 0) {
			return parsedProps();
		}

		const value = parsedStyle[prop];
		callback(
			{
				type: 'inline',
				prop,
				value,
				item,
			},
			(result) => {
				if (result !== value) {
					changed = true;
					if (result === void 0) {
						delete parsedStyle[prop];
					} else {
						parsedStyle[prop] = result;
					}
				}
				nextProp();
			}
		);
	};
	nextProp();
}

/**
 * Parse styles in SVG
 *
 * This function finds CSS in SVG, parses it, calls callback for each rule.
 * Callback should return new value (string) or undefined to remove rule.
 * Callback can be asynchronous.
 */
export async function parseSVGStyle(
	svg: SVG,
	callback: ParseSVGStyleCallback
): Promise<void> {
	return parseSVG(svg, (item) => {
		return new Promise((fulfill, reject) => {
			try {
				parseItem(
					item,
					(styleItem, done) => {
						try {
							const result = callback(styleItem);
							if (result instanceof Promise) {
								result.then(done).catch(reject);
							} else {
								done(result);
							}
						} catch (err) {
							reject(err);
						}
					},
					fulfill
				);
			} catch (err) {
				reject(err);
			}
		});
	});
}

/**
 * Synchronous version
 */
export function parseSVGStyleSync(
	svg: SVG,
	callback: ParseSVGStyleCallbackSync
): void {
	let isSync = true;
	parseSVGSync(svg, (item) => {
		parseItem(
			item,
			(styleItem, done) => {
				done(callback(styleItem));
			},
			() => {
				if (!isSync) {
					throw new Error('parseSVGStyleSync callback was async');
				}
			}
		);
	});
	isSync = false;
}

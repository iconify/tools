import type { SVG } from '.';
import { parseInlineStyle } from '../css/parse';
import { tokensToString } from '../css/parser/export';
import { getTokens } from '../css/parser/tokens';
import { tokensTree } from '../css/parser/tree';
import type {
	CSSAtRuleToken,
	CSSRuleToken,
	CSSToken,
} from '../css/parser/types';
import { parseSVG, ParseSVGCallbackItem } from './parse';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertNever(v: never) {
	//
}

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

interface ParseSVGStyleCallbackItemGlobalAtRule
	extends ParseSVGStyleCallbackItemCommon {
	token: CSSAtRuleToken;
	childTokens: CSSToken[];
	prevTokens: (CSSToken | null)[];
	nextTokens: CSSToken[];
}
interface ParseSVGStyleCallbackItemGlobalGenericAtRule
	extends ParseSVGStyleCallbackItemGlobalAtRule {
	type: 'at-rule';
}
interface ParseSVGStyleCallbackItemGlobalKeyframesAtRule
	extends ParseSVGStyleCallbackItemGlobalAtRule {
	type: 'keyframes';
	from: Record<string, string>;
}

export type ParseSVGStyleCallbackItem =
	| ParseSVGStyleCallbackItemInline
	| ParseSVGStyleCallbackItemGlobal
	| ParseSVGStyleCallbackItemGlobalGenericAtRule
	| ParseSVGStyleCallbackItemGlobalKeyframesAtRule;

/**
 * Result: undefined to remove item, string to change/keep item
 */
export type ParseSVGStyleCallbackResult = string | undefined;

/**
 * Callback function
 */
export type ParseSVGStyleCallback = (
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
		let newTokens: (CSSToken | null)[] = [];

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
					item.$element.text('\n' + newContent);
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
					selectorStart.push(newTokens.length);
					newTokens.push(token);
					return nextToken();

				case 'close':
					selectorStart.pop();
					newTokens.push(token);
					return nextToken();

				case 'at-rule': {
					selectorStart.push(newTokens.length);

					const prop = token.rule;
					const value = token.value;

					const isAnimation =
						prop === 'keyframes' ||
						(prop.slice(0, 1) === '-' &&
							prop.split('-').pop() === 'keyframes');

					// Get all child tokens, including closing token
					const childTokens: CSSToken[] = [];
					const animationRules = Object.create(null) as Record<
						string,
						string
					>;
					let depth = 1;
					let index = 0;
					let isFrom = false;

					while (depth > 0) {
						const childToken = tokens[index];
						index++;
						if (!childToken) {
							throw new Error('Something went wrong parsing CSS');
						}
						childTokens.push(childToken);
						switch (childToken.type) {
							case 'close': {
								depth--;
								isFrom = false;
								break;
							}
							case 'selector': {
								depth++;
								if (isAnimation) {
									const rule = childToken.code;
									if (rule === 'from' || rule === '0%') {
										isFrom = true;
									}
								}
								break;
							}

							case 'at-rule': {
								depth++;
								if (isAnimation) {
									throw new Error(
										'Nested at-rule in keyframes ???'
									);
								}
								break;
							}

							case 'rule': {
								if (isAnimation && isFrom) {
									animationRules[childToken.prop] =
										childToken.value;
								}
								break;
							}

							default:
								assertNever(childToken);
						}
					}
					const skipCount = childTokens.length;

					callback(
						isAnimation
							? {
									type: 'keyframes',
									prop,
									value,
									token,
									childTokens,
									from: animationRules,
									prevTokens: newTokens,
									nextTokens: tokens.slice(0),
							  }
							: {
									type: 'at-rule',
									prop,
									value,
									token,
									childTokens,
									prevTokens: newTokens,
									nextTokens: tokens.slice(0),
							  },
						(result) => {
							if (result !== void 0) {
								if (isAnimation) {
									// Allow changing animation name
									if (result !== value) {
										changed = true;
										token.value = result;
									}
									newTokens.push(token);

									// Skip all child tokens, copy them as is
									for (let i = 0; i < skipCount; i++) {
										tokens.shift();
									}
									newTokens = newTokens.concat(childTokens);
								} else {
									// Not animation
									if (result !== value) {
										throw new Error(
											'Changing value for at-rule is not supported'
										);
									}
									newTokens.push(token);
								}
							} else {
								// Delete token and all child tokens
								changed = true;
								for (let i = 0; i < skipCount; i++) {
									tokens.shift();
								}
							}

							nextToken();
						}
					);
					return;
				}

				case 'rule': {
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
											return prev.concat(
												current.selectors
											);
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
					return;
				}

				default:
					assertNever(token);
			}
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
 */
export function parseSVGStyle(svg: SVG, callback: ParseSVGStyleCallback): void {
	let isSync = true;
	parseSVG(svg, (item) => {
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

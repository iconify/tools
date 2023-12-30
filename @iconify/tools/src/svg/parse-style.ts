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
 * Check callback result for Promise instance, which used to be supported in old version
 */
function assertNotOldCode(value: unknown) {
	if (value instanceof Promise) {
		// Old code
		throw new Error('parseSVGStyle does not support async callbacks');
	}
}

/**
 * Parse styles in SVG
 *
 * This function finds CSS in SVG, parses it, calls callback for each rule.
 * Callback should return new value (string) or undefined to remove rule.
 */
export function parseSVGStyle(svg: SVG, callback: ParseSVGStyleCallback): void {
	parseSVG(svg, (item) => {
		const tagName = item.tagName;
		const $element = item.$element;

		// Parse <style> tag
		function parseStyleItem() {
			const content = $element.text();
			if (typeof content !== 'string') {
				$element.remove();
				return;
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

			while (tokens.length) {
				const token = tokens.shift();
				if (!token) {
					break;
				}

				switch (token.type) {
					case 'selector':
						selectorStart.push(newTokens.length);
						newTokens.push(token);
						break;

					case 'close':
						selectorStart.pop();
						newTokens.push(token);
						break;

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
								throw new Error(
									'Something went wrong parsing CSS'
								);
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

						const result = callback(
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
									}
						);

						if (result !== undefined) {
							assertNotOldCode(result);

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

						break;
					}

					case 'rule': {
						const value = token.value;
						const selectorTokens = selectorStart
							.map((index) => newTokens[index])
							.filter((item) => item !== null) as CSSToken[];
						const result = callback({
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
						});
						if (result !== undefined) {
							assertNotOldCode(result);

							if (result !== value) {
								changed = true;
								token.value = result;
							}
							newTokens.push(token);
						} else {
							// Delete token
							changed = true;
						}

						break;
					}

					default:
						assertNever(token);
				}
			}

			// Done
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
		}

		// Parse <style> tag
		if (tagName === 'style') {
			parseStyleItem();
			return;
		}

		// Parse style
		const attribs = item.element.attribs;
		if (attribs.style === undefined) {
			return;
		}

		const parsedStyle = parseInlineStyle(attribs.style);
		if (parsedStyle === null) {
			// Ignore style
			$element.removeAttr('style');
			return;
		}

		// Parse all props
		let changed = false;
		for (const prop in parsedStyle) {
			const value = parsedStyle[prop];
			const result = callback({
				type: 'inline',
				prop,
				value,
				item,
			});
			assertNotOldCode(result);

			if (result !== value) {
				changed = true;
				if (result === undefined) {
					delete parsedStyle[prop];
				} else {
					parsedStyle[prop] = result;
				}
			}
		}

		// Done
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
	});
}

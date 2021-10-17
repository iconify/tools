import {
	compareColors,
	stringToColor,
	colorToString,
} from '@iconify/utils/lib/colors';
import type { Color } from '@iconify/utils/lib/colors/types';
import type { SVG } from '../svg';
import { parseSVG, ParseSVGCallbackItem } from '../svg/parse';
import { maskAndSymbolTags, shapeTags } from '../svg/data/tags';

interface FindColorsResult {
	// Custom colors
	colors: Color[];
	// Uses default fill
	defaultFill: boolean;
}

interface ExtendedParseSVGCallbackItem extends ParseSVGCallbackItem {
	'fill'?: Color;
	'stroke'?: Color;
	'stop-color'?: Color;
}

type ColorAttributes = 'fill' | 'stroke' | 'stop-color';
const testAttributes: ColorAttributes[] = ['fill', 'stroke'];

/**
 * Find color in parent element
 */
function checkParents(
	parents: ExtendedParseSVGCallbackItem[],
	attr: ColorAttributes
): Color | null {
	for (let i = 0; i < parents.length; i++) {
		const value = parents[i][attr];
		if (value) {
			return value;
		}
	}
	return null;
}

/**
 * Options
 */

// Callback called for each color: returns new color, undefined if color should not be changed
type ParseColorsCallbackResult = Color | string | undefined;
type ParseColorsCallback = (
	color: Color,
	attr: ColorAttributes,
	item: ExtendedParseSVGCallbackItem
) => ParseColorsCallbackResult | Promise<ParseColorsCallbackResult>;

// Options
export interface ParseColorsOptions {
	// Callback
	callback?: ParseColorsCallback;

	// Default fill
	defaultFill?: Color | string;
}

/**
 * Find colors in icon
 */
export async function parseColors(
	svg: SVG,
	options: ParseColorsOptions = {}
): Promise<FindColorsResult> {
	const result: FindColorsResult = {
		colors: [],
		defaultFill: false,
	};

	/**
	 * Find matching color in results
	 */
	function findColor(color: Color): Color | null {
		for (let i = 0; i < result.colors.length; i++) {
			if (compareColors(result.colors[i], color)) {
				return result.colors[i];
			}
		}
		return null;
	}

	/**
	 * Discover color
	 */
	async function addColor(
		item: ExtendedParseSVGCallbackItem,
		attr: ColorAttributes,
		value: string
	) {
		let color = stringToColor(value);
		if (!color) {
			return;
		}

		if (options.callback) {
			let callbackResult = options.callback(color, attr, item);
			if (callbackResult instanceof Promise) {
				callbackResult = await callbackResult;
			}

			// Change color
			switch (typeof callbackResult) {
				case 'string': {
					color = stringToColor(callbackResult);
					item.$element.attr(attr, callbackResult);
					if (!color) {
						// New color cannot be parsed: change attribute, but do not add to list
						return;
					}
					break;
				}

				case 'object': {
					color = callbackResult;
					const colorStr = colorToString(color);
					item.$element.attr(attr, colorStr);
					break;
				}
			}
		}

		// Find and set color
		const match = findColor(color);
		if (!match) {
			result.colors.push(color);
		} else {
			color = match;
		}
		item[attr] = color;
	}

	// Get all colors
	await parseSVG(svg, async (item: ExtendedParseSVGCallbackItem) => {
		const tagName = item.tagName;

		if (maskAndSymbolTags.has(tagName)) {
			// Mask: ignore it
			item.testChildren = false;
			return;
		}

		// Test for fill/stroke
		const attribs = item.element.attribs;
		for (let i = 0; i < testAttributes.length; i++) {
			const attr = testAttributes[i];
			const value = attribs[attr];
			if (value !== void 0) {
				await addColor(item, attr, value);
			}
		}

		// Check for shape
		if (shapeTags.has(tagName)) {
			for (let i = 0; i < testAttributes.length; i++) {
				const attr = testAttributes[i];
				if (attr === 'stop-color') {
					// Cannot inherit 'stop-color'
					continue;
				}

				// Find color from parent element
				if (!item[attr]) {
					const parentColor = checkParents(item.parents, attr);
					if (parentColor) {
						item[attr] = parentColor;
					}
				}

				// Missing fill
				if (attr === 'fill' && !item[attr]) {
					if (options.defaultFill) {
						// Set fill
						const defaultFill = options.defaultFill;
						const color =
							typeof defaultFill === 'object'
								? colorToString(defaultFill)
								: defaultFill;
						item.$element.attr(attr, color);

						// Add to list of colors
						await addColor(item, 'fill', color);
					} else {
						result.defaultFill = true;
					}
				}
			}
		}

		// Special handling
		switch (tagName) {
			case 'defs': {
				// Ignore parents
				item.parents = [];
				break;
			}

			case 'stop': {
				// Check 'stop-color'
				const attr = 'stop-color';
				const stopColor = attribs[attr];
				if (stopColor !== void 0) {
					addColor(item, attr, stopColor);
				}
				break;
			}
		}
	});

	return result;
}

import {
	compareColors,
	stringToColor,
	colorToString,
} from '@iconify/utils/lib/colors';
import type { Color } from '@iconify/utils/lib/colors/types';
import type { SVG } from '../svg';
import { parseSVG, ParseSVGCallbackItem } from '../svg/parse';
import { animateTags, maskAndSymbolTags, shapeTags } from '../svg/data/tags';
import { parseSVGStyle } from '../svg/parse-style';
import {
	ColorAttributes,
	defaultBlackColor,
	defaultColorValues,
	shapeColorAttributes,
	specialColorAttributes,
} from './attribs';
import { tagSpecificPresentationalAttributes } from '../svg/data/attributes';

/**
 * Result
 */
interface FindColorsResult {
	// Custom colors
	colors: (Color | string)[];

	// Has default color
	hasUnsetColor: boolean;

	// Has global style, making detection of default fill unreliable
	hasGlobalStyle: boolean;
}

/**
 * Callback to call for each found color
 *
 * Callback should return:
 * - new color value to change color
 * - first parameter to keep old value
 * - undefined to delete old value
 */
type ParseColorsCallbackResult = Color | string | undefined;
type ParseColorsCallback = (
	attr: ColorAttributes,
	// Value is Color if color can be parsed, string if color is unsupported/invalid
	color: Color | string,
	// tagName is set only for colors found in element, it is not set for colors in global style
	tagName?: string
) => ParseColorsCallbackResult | Promise<ParseColorsCallbackResult>;

/**
 * Options
 */

export interface ParseColorsOptions {
	// Callback
	callback?: ParseColorsCallback;

	// Default color
	defaultColor?: Color | string;
}

/**
 * Properties to check
 */
const propsToCheck = Object.keys(defaultColorValues);

const animatePropsToCheck = ['from', 'to', 'values'];

/**
 * Extend properties for item
 */
type ItemColors = Partial<Record<ColorAttributes, Color | string>>;
interface ExtendedParseSVGCallbackItem extends ParseSVGCallbackItem {
	// Colors set in item
	colors?: ItemColors;
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
		hasUnsetColor: false,
		hasGlobalStyle: false,
	};

	// Default color
	const defaultColor =
		typeof options.defaultColor === 'string'
			? stringToColor(options.defaultColor)
			: options.defaultColor;

	/**
	 * Find matching color in results
	 */
	function findColor(
		color: Color | string,
		add: false
	): Color | string | null;
	function findColor(color: Color | string, add: true): Color | string;
	function findColor(
		color: Color | string,
		add = false
	): Color | string | null {
		const isString = typeof color === 'string';
		for (let i = 0; i < result.colors.length; i++) {
			const item = result.colors[i];
			if (item === color) {
				return item;
			}
			if (
				!isString &&
				typeof item !== 'string' &&
				compareColors(item, color)
			) {
				return item;
			}
		}
		if (add) {
			result.colors.push(color);
			return color;
		}
		return null;
	}

	/**
	 * Add color to item and to results
	 */
	function addColorToItem(
		prop: ColorAttributes,
		color: Color | string,
		item?: ExtendedParseSVGCallbackItem
	): void {
		const addedColor = findColor(color, true);
		if (item) {
			const itemColors = item.colors || {};
			if (!item.colors) {
				item.colors = itemColors;
			}
			itemColors[prop] = addedColor;
		}
	}

	/**
	 * Get element color
	 */
	function getElementColor(
		prop: ColorAttributes,
		item: ExtendedParseSVGCallbackItem
	): Color | string {
		function find(prop: ColorAttributes): Color | string {
			let currentItem = item;
			while (currentItem) {
				const color = currentItem.colors?.[prop];
				if (color !== void 0) {
					return color;
				}
				currentItem = currentItem.parents[0];
			}
			return defaultColorValues[prop];
		}

		let propColor = find(prop);
		if (
			typeof propColor === 'object' &&
			propColor.type === 'current' &&
			prop !== 'color'
		) {
			// currentColor: get color
			propColor = find('color');
		}
		return propColor;
	}

	/**
	 * Change color
	 */
	async function checkColor(
		prop: ColorAttributes,
		value: string,
		item?: ExtendedParseSVGCallbackItem
	): Promise<string | undefined> {
		// Ignore empty values
		switch (value.trim().toLowerCase()) {
			case '':
			case 'inherit':
				return;
		}

		// Resolve color
		const color = stringToColor(value);
		const defaultValue = color || value;

		// Check if callback exists
		if (!options.callback) {
			addColorToItem(prop, defaultValue, item);
			return value;
		}

		// Call callback
		let callbackResult = options.callback(
			prop,
			defaultValue,
			item?.tagName
		);
		callbackResult =
			callbackResult instanceof Promise
				? await callbackResult
				: callbackResult;

		// Remove entry
		if (callbackResult === void 0) {
			return callbackResult;
		}

		if (callbackResult === defaultValue) {
			// Not changed
			addColorToItem(prop, defaultValue, item);
			return value;
		}

		if (typeof callbackResult === 'string') {
			const newColor = stringToColor(callbackResult);
			addColorToItem(prop, newColor || callbackResult, item);
			return callbackResult;
		}

		// Color
		const newValue = colorToString(callbackResult);
		addColorToItem(prop, callbackResult, item);
		return newValue;
	}

	// Parse colors in style
	await parseSVGStyle(
		svg,
		async (item) => {
			const prop = item.prop;
			const value = item.value;
			if (propsToCheck.indexOf(prop) === -1) {
				return value;
			}

			// Color
			const attr = prop as ColorAttributes;
			const newValue = checkColor(attr, value);
			if (newValue === void 0) {
				return newValue;
			}

			// Got color
			if (item.type === 'global') {
				result.hasGlobalStyle = true;
			}
			return newValue;
		},
		{
			skipMasks: true,
		}
	);

	// Parse colors in SVG
	await parseSVG(svg, async (item: ExtendedParseSVGCallbackItem) => {
		const tagName = item.tagName;
		if (maskAndSymbolTags.has(tagName)) {
			// Ignore masks
			item.testChildren = false;
			return;
		}

		const $element = item.$element;
		const attribs = item.element.attribs;

		// Check common properties
		for (let i = 0; i < propsToCheck.length; i++) {
			const prop = propsToCheck[i];
			if (prop === 'fill' && animateTags.has(tagName)) {
				// 'fill' has different meaning in animations
				continue;
			}

			const value = attribs[prop];
			if (value !== void 0) {
				const newValue = await checkColor(
					prop as ColorAttributes,
					value,
					item
				);
				if (newValue !== value) {
					if (newValue === void 0) {
						$element.removeAttr(prop);
					} else {
						$element.attr(prop, newValue);
					}
				}
			}
		}

		// Check animations
		if (animateTags.has(tagName)) {
			const attr = attribs.attributeName as ColorAttributes;
			if (propsToCheck.indexOf(attr) !== -1) {
				// Valid property
				for (let i = 0; i < animatePropsToCheck.length; i++) {
					const elementProp = animatePropsToCheck[i];
					const fullValue = attribs[elementProp];
					if (typeof fullValue !== 'string') {
						continue;
					}

					// Split values
					const splitValues = fullValue.split(';');
					let updatedValues = false;
					for (let j = 0; j < splitValues.length; j++) {
						const value = splitValues[j];
						if (value !== void 0) {
							const newValue = await checkColor(
								elementProp as ColorAttributes,
								value
								// Do not pass third parameter
							);
							if (newValue !== value) {
								updatedValues = true;
								splitValues[j] =
									typeof newValue === 'string'
										? newValue
										: '';
							}
						}
					}

					// Merge values back
					if (updatedValues) {
						$element.attr(elementProp, splitValues.join(';'));
					}
				}
			}
		}

		// Check shape for default colors
		if (!result.hasGlobalStyle) {
			// Get list of properties required to render element
			let requiredProps: ColorAttributes[] | undefined;

			if (shapeTags.has(tagName)) {
				requiredProps = shapeColorAttributes;
			}

			specialColorAttributes.forEach((attr) => {
				if (tagSpecificPresentationalAttributes[tagName]?.has(attr)) {
					requiredProps = [attr];
				}
			});

			// Check colors
			if (requiredProps) {
				const itemColors = item.colors || {};
				if (!item.colors) {
					item.colors = itemColors;
				}

				for (let i = 0; i < requiredProps.length; i++) {
					const prop = requiredProps[i];
					const color = getElementColor(prop, item);
					if (color === defaultBlackColor) {
						// Default black color: change it
						result.hasUnsetColor = true;
						if (defaultColor) {
							// Add color to results and change attribute
							findColor(defaultColor, true);
							$element.attr(prop, colorToString(defaultColor));
							itemColors[prop] = defaultColor;
						}
					}
				}
			}
		}
	});

	return result;
}

/**
 * Check if color is empty, such as 'none' or 'transparent'
 */
export function isEmptyColor(color: Color): boolean {
	const type = color.type;
	return type === 'none' || type === 'transparent';
}

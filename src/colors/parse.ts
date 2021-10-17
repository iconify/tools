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
	colors: Color[];

	// Has default fill
	hasDefaultFill: boolean;

	// Has global style, making detection of default fill unreliable
	hasGlobalStyle: boolean;
}

/**
 * Options
 */

type ParseColorsCallbackResult = Color | string | undefined;

// Callback should return: new color value, undefined to keep old value
type ParseColorsCallback = (
	attr: ColorAttributes,
	color: Color
) => ParseColorsCallbackResult | Promise<ParseColorsCallbackResult>;

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
type ItemColors = Partial<Record<ColorAttributes, Color>>;
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
		hasDefaultFill: false,
		hasGlobalStyle: false,
	};

	// Get default color
	const defaultColor =
		typeof options.defaultColor === 'string'
			? stringToColor(options.defaultColor)
			: options.defaultColor;

	/**
	 * Find matching color in results
	 */
	function findColor(color: Color, add: false): Color | null;
	function findColor(color: Color, add: true): Color;
	function findColor(color: Color, add = false): Color | null {
		for (let i = 0; i < result.colors.length; i++) {
			if (compareColors(result.colors[i], color)) {
				return result.colors[i];
			}
		}
		if (add) {
			result.colors.push(color);
			return color;
		}
		return null;
	}

	/**
	 * Get element color
	 */
	function getElementColor(
		prop: ColorAttributes,
		item: ExtendedParseSVGCallbackItem
	): Color {
		function find(prop: ColorAttributes): Color {
			let currentItem = item;
			while (currentItem) {
				const color = currentItem.colors?.[prop];
				if (color) {
					return color;
				}
				currentItem = currentItem.parents[0];
			}
			return defaultColorValues[prop];
		}

		let propColor = find(prop);
		if (propColor?.type === 'current' && prop !== 'color') {
			// currentColor: get color
			propColor = find('color');
		}
		return propColor;
	}

	/**
	 * Change color
	 */
	async function changeColor(
		prop: ColorAttributes,
		value: Color
	): Promise<Color | undefined> {
		if (!options.callback) {
			return;
		}

		let result = options.callback(prop, value);
		if (result instanceof Promise) {
			result = await result;
		}

		if (typeof result === 'string') {
			const newColor = stringToColor(result);
			if (!newColor) {
				throw new Error(`Invalid color value: ${result}`);
			}
			return newColor;
		}
		return result;
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
			const color = stringToColor(value);
			if (!color) {
				return value;
			}

			// Global style?
			if (item.type === 'global') {
				result.hasGlobalStyle = true;
			}

			// Get new color
			const attr = prop as ColorAttributes;
			const newColor = (await changeColor(attr, color)) || color;

			// Check if color has changed
			const changed = newColor && newColor !== color;

			// Add color to results
			findColor(newColor, true);

			// Return string if color was changed
			return changed ? colorToString(newColor) : value;
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

		let hasColors = false;
		const itemColors: ItemColors = {};

		/**
		 * Check color
		 */
		const check = async (
			attr: ColorAttributes,
			value: string,
			isAnimated: boolean
		): Promise<string | undefined> => {
			// Get color
			const color = stringToColor(value);
			if (!color) {
				// Invalid color: ignore it
				return;
			}

			// Get new color
			const newColor = (await changeColor(attr, color)) || color;

			// Check if color has changed
			const changed = newColor && newColor !== color;

			// Add color to results
			const colorItem = findColor(newColor, true);
			hasColors = true;
			if (!isAnimated) {
				itemColors[attr] = colorItem;
			}

			// Change color
			if (changed) {
				return colorToString(newColor);
			}
		};

		// Check common properties
		for (let i = 0; i < propsToCheck.length; i++) {
			const prop = propsToCheck[i];
			if (prop === 'fill' && animateTags.has(tagName)) {
				// 'fill' has different meaning in animations
				continue;
			}

			const value = attribs[prop];
			if (value !== void 0) {
				const newValue = await check(
					prop as ColorAttributes,
					value,
					false
				);
				if (typeof newValue === 'string') {
					$element.attr(prop, newValue);
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
							const newValue = await check(
								elementProp as ColorAttributes,
								value,
								true
							);
							if (typeof newValue === 'string') {
								updatedValues = true;
								splitValues[j] = newValue;
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

		// Store colors in element
		if (hasColors) {
			item.colors = itemColors;
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
				for (let i = 0; i < requiredProps.length; i++) {
					const prop = requiredProps[i];
					const color = getElementColor(prop, item);
					if (color === defaultBlackColor) {
						// Black color: change it
						result.hasDefaultFill = true;
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

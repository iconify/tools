import {
	compareColors,
	stringToColor,
	colorToString,
} from '@iconify/utils/lib/colors';
import type { Color } from '@iconify/utils/lib/colors/types';
import type { SVG } from '../svg';
import { animateTags, shapeTags } from '../svg/data/tags';
import {
	ParseSVGStyleCallbackItem,
	ParseSVGStyleCallbackResult,
	parseSVGStyle,
} from '../svg/parse-style';
import {
	allowDefaultColorValue,
	ColorAttributes,
	defaultBlackColor,
	defaultColorValues,
	shapeColorAttributes,
	specialColorAttributes,
} from './attribs';
import { tagSpecificPresentationalAttributes } from '../svg/data/attributes';
import { analyseSVGStructure } from '../svg/analyse';
import type {
	AnalyseSVGStructureResult,
	ElementsTreeItem,
	ExtendedTagElement,
	ElementsMap,
	AnalyseSVGStructureOptions,
} from '../svg/analyse/types';

/**
 * Result
 */
export interface FindColorsResult {
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
 * - 'unset' to delete old value
 * - 'remove' to remove shape or rule
 */
type ParseColorsCallbackResult = Color | string | 'remove' | 'unset';

type ParseColorsCallback<T> = (
	attr: ColorAttributes,
	// Value is Color if color can be parsed, string if color is unsupported/invalid
	colorString: string,
	// Parsed color, if color could be parsed, null if color could not be parsed
	parsedColor: Color | null,
	// tagName and item are set only for colors found in element, it is not set for colors in global style
	tagName?: string,
	item?: ExtendedTagElementWithColors
) => T;

/**
 * Callback for default color
 */
export type ParseColorOptionsDefaultColorCallback = (
	prop: string,
	item: ExtendedTagElementWithColors,
	treeItem: ElementsTreeItem,
	iconData: AnalyseSVGStructureResult
) => Color;

/**
 * Options
 */
interface Options<T> extends AnalyseSVGStructureOptions {
	// Callback
	callback?: T;

	// Default color
	defaultColor?: Color | string | ParseColorOptionsDefaultColorCallback;
}

export type ParseColorsOptions = Options<
	ParseColorsCallback<ParseColorsCallbackResult>
>;

/**
 * Properties to check
 */
const propsToCheck = Object.keys(defaultColorValues);

const animatePropsToCheck = ['from', 'to', 'values'];

/**
 * Extend properties for element
 */
type ItemColors = Partial<Record<ColorAttributes, Color | string>>;

export interface ExtendedTagElementWithColors extends ExtendedTagElement {
	// Colors set in item
	_colors?: ItemColors;

	// Removed
	_removed?: boolean;
}

/**
 * Context to pass between various functions
 */
interface ParserContext {
	result: FindColorsResult;
	defaultColor:
		| Color
		| ParseColorOptionsDefaultColorCallback
		| null
		| undefined;
	rawOptions: AnalyseSVGStructureOptions;
	findColor: (color: Color | string, add: boolean) => Color | string | null;
	addColorToItem: (
		prop: ColorAttributes,
		color: Color | string,
		item?: ExtendedTagElementWithColors,
		add?: boolean
	) => void;
	getElementColor: (
		prop: ColorAttributes,
		item: ElementsTreeItem,
		elements: ElementsMap
	) => Color | string | null;
	checkColor: (
		done: (result?: string) => void,
		prop: ColorAttributes,
		value: string,
		item?: ExtendedTagElementWithColors
	) => void;
	parseStyleItem: (
		item: ParseSVGStyleCallbackItem,
		done: (result: ParseSVGStyleCallbackResult) => void
	) => void;
}

/**
 * Init data and reusable functions that use it
 */
function createContext(
	options: Omit<Options<void>, 'callback'>,
	callback?: (
		params: Parameters<ParseColorsCallback<void>>,
		done: (result: ParseColorsCallbackResult) => void
	) => void
): ParserContext {
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
		item?: ExtendedTagElementWithColors,
		add = true
	): void {
		const addedColor = findColor(color, add !== false);
		if (item) {
			const itemColors = item._colors || (item._colors = {});
			itemColors[prop] = addedColor === null ? color : addedColor;
		}
	}

	/**
	 * Get element color
	 */
	function getElementColor(
		prop: ColorAttributes,
		item: ElementsTreeItem,
		elements: ElementsMap
	): Color | string | null {
		function find(prop: ColorAttributes): Color | string | null {
			let currentItem: ElementsTreeItem | undefined = item;

			const allowDefaultColor = allowDefaultColorValue[prop];

			while (currentItem) {
				const element = elements.get(
					currentItem.index
				) as ExtendedTagElementWithColors;

				const color = element._colors?.[prop];
				if (color !== void 0) {
					return color;
				}

				// Allow default color?
				if (allowDefaultColor) {
					if (
						allowDefaultColor === true ||
						element.attribs[allowDefaultColor]
					) {
						return null;
					}
				}

				// Parent item
				currentItem = currentItem.parent;
				if (currentItem?.usedAsMask) {
					// Used as mask: color from parent item is irrelevant
					return defaultColorValues[prop];
				}
			}

			return defaultColorValues[prop];
		}

		let propColor = find(prop);
		if (
			propColor !== null &&
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
	function checkColor(
		done: (result?: string) => void,
		prop: ColorAttributes,
		value: string,
		item?: ExtendedTagElementWithColors
	): void {
		// Ignore empty values
		switch (value.trim().toLowerCase()) {
			case '':
			case 'inherit':
				return done();
		}

		// Resolve color
		const parsedColor = stringToColor(value);
		const defaultValue = parsedColor || value;

		// Ignore url()
		if (parsedColor?.type === 'function' && parsedColor.func === 'url') {
			// Add to item, so it won't be treated as missing, but do not add to results
			addColorToItem(prop, defaultValue, item, false);
			return done(value);
		}

		// Check if callback exists
		if (!callback) {
			addColorToItem(prop, defaultValue, item);
			return done(value);
		}

		// Call callback
		callback(
			[prop, value, parsedColor, item?.tagName, item],
			(callbackResult) => {
				// Remove entry
				switch (callbackResult) {
					case 'remove': {
						return done(item ? callbackResult : void 0);
					}

					case 'unset':
						return done();
				}

				if (
					callbackResult === value ||
					(parsedColor && callbackResult === parsedColor)
				) {
					// Not changed
					addColorToItem(prop, defaultValue, item);
					return done(value);
				}

				if (typeof callbackResult === 'string') {
					const newColor = stringToColor(callbackResult);
					addColorToItem(prop, newColor || callbackResult, item);
					return done(callbackResult);
				}

				// Color
				const newValue = colorToString(callbackResult);
				addColorToItem(prop, callbackResult, item);
				return done(newValue);
			}
		);
	}

	/**
	 * Wrapped callback for parseSVGStyle / parseSVGStyleSync
	 */
	function parseStyleItem(
		item: ParseSVGStyleCallbackItem,
		done: (result: ParseSVGStyleCallbackResult) => void
	): void {
		const prop = item.prop;
		const value = item.value;
		if (propsToCheck.indexOf(prop) === -1) {
			return done(value);
		}

		// Color
		const attr = prop as ColorAttributes;
		checkColor(
			(newValue) => {
				if (newValue === void 0) {
					return done(newValue);
				}

				// Got color
				if (item.type === 'global') {
					result.hasGlobalStyle = true;
				}

				return done(newValue);
			},
			attr,
			value
		);
	}

	return {
		result,
		defaultColor,
		rawOptions: options,
		findColor,
		addColorToItem,
		getElementColor,
		checkColor,
		parseStyleItem,
	};
}

/**
 * Check SVG, call done() when done
 *
 * Uses callback hell to support both synchronous and async callbacks
 */
function analyseSVG(svg: SVG, context: ParserContext, done: () => void): void {
	// Analyse SVG
	const iconData = analyseSVGStructure(svg, context.rawOptions);
	const { elements, tree } = iconData;
	const cheerio = svg.$svg;
	const removedElements: Set<number> = new Set();
	const parsedElements: Set<number> = new Set();

	// Remove element
	function removeElement(
		index: number,
		element: ExtendedTagElementWithColors
	) {
		// Mark all children as removed (direct children as in DOM)
		function removeChildren(element: ExtendedTagElementWithColors) {
			element.children.forEach((item) => {
				if (item.type !== 'tag') {
					return;
				}
				const element = item as ExtendedTagElementWithColors;
				const index = element._index;
				if (index && !removedElements.has(index)) {
					element._removed = true;
					removedElements.add(index);
					removeChildren(element);
				}
			});
		}

		// Remove element
		element._removed = true;
		removedElements.add(index);
		removeChildren(element);
		cheerio(element).remove();
	}

	/**
	 * Parse tree item and its children
	 */
	function parseTreeItem(item: ElementsTreeItem, done: () => void) {
		const index = item.index;
		if (removedElements.has(index) || parsedElements.has(index)) {
			return done();
		}
		parsedElements.add(index);

		const element = elements.get(index) as ExtendedTagElementWithColors;
		if (element._removed) {
			return done();
		}

		const { tagName, attribs } = element;

		// Copy colors from parent item
		if (item.parent) {
			const parentIndex = item.parent.index;
			const parentElement = elements.get(
				parentIndex
			) as ExtendedTagElementWithColors;
			if (parentElement._colors) {
				element._colors = {
					...parentElement._colors,
				};
			}
		}

		// Check common properties
		function parseCommonProps(done: () => void): void {
			const propsQueue: [ColorAttributes, string][] = [];
			for (let i = 0; i < propsToCheck.length; i++) {
				const prop = propsToCheck[i] as ColorAttributes;
				if (prop === 'fill' && animateTags.has(tagName)) {
					// 'fill' has different meaning in animations
					continue;
				}

				const value = attribs[prop];
				if (value !== void 0) {
					propsQueue.push([prop, value]);
				}
			}

			const parsePropsQueue = () => {
				const queueItem = propsQueue.shift();
				if (!queueItem) {
					return done();
				}

				const [prop, value] = queueItem;
				context.checkColor(
					(newValue) => {
						if (newValue !== value) {
							if (newValue === void 0) {
								// Unset
								cheerio(element).removeAttr(prop);
								if (element._colors) {
									delete element._colors[prop];
								}
							} else if (newValue === 'remove') {
								// Remove element
								removeElement(index, element);
							} else {
								// Change attribute
								// Value in element._colors is changed in checkColor()
								cheerio(element).attr(prop, newValue);
							}
						}

						// Next queue item
						return parsePropsQueue();
					},
					prop,
					value,
					element
				);
			};

			parsePropsQueue();
		}

		// Check animations
		function checkAnimations(done: () => void): void {
			const propsQueue: [string, string][] = [];
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
						propsQueue.push([elementProp, fullValue]);
					}
				}
			}

			const parsePropsQueue = (): void => {
				const queueItem = propsQueue.shift();
				if (!queueItem) {
					// Parsed all items
					return done();
				}
				const [elementProp, fullValue] = queueItem;

				// Split values, check each one separately
				const splitValues = fullValue.split(';');
				let updatedValues = false;

				// Parsed all items
				const parsedAllItems = (): void => {
					// Merge values back
					if (updatedValues) {
						cheerio(element).attr(
							elementProp,
							splitValues.join(';')
						);
					}

					// Parse next queue item
					return parsePropsQueue();
				};

				// Check one item
				const parseItem = (index: number): void => {
					if (index >= splitValues.length) {
						return parsedAllItems();
					}

					const value = splitValues[index];
					if (value === void 0) {
						return parseItem(index + 1);
					}

					context.checkColor(
						(newValue) => {
							if (newValue !== value) {
								updatedValues = true;
								splitValues[index] =
									typeof newValue === 'string'
										? newValue
										: '';
							}
							parseItem(index + 1);
						},
						elementProp as ColorAttributes,
						value
						// Do not pass third parameter
					);
				};
				parseItem(0);
			};

			parsePropsQueue();
		}

		// Callback hell !!!
		parseCommonProps(() => {
			checkAnimations(() => {
				// Check shape for default colors
				if (!context.result.hasGlobalStyle) {
					// Get list of properties required to render element
					let requiredProps: ColorAttributes[] | undefined;

					if (shapeTags.has(tagName)) {
						requiredProps = shapeColorAttributes;
					}

					specialColorAttributes.forEach((attr) => {
						if (
							tagSpecificPresentationalAttributes[tagName]?.has(
								attr
							)
						) {
							requiredProps = [attr];
						}
					});

					// Check colors
					if (requiredProps) {
						const itemColors =
							element._colors || (element._colors = {});

						for (let i = 0; i < requiredProps.length; i++) {
							const prop = requiredProps[i];
							const color = context.getElementColor(
								prop,
								item,
								elements
							);
							if (color === defaultBlackColor) {
								// Default black color: change it
								const defaultColor = context.defaultColor;
								if (defaultColor) {
									const defaultColorValue =
										typeof defaultColor === 'function'
											? defaultColor(
													prop,
													element,
													item,
													iconData
											  )
											: defaultColor;

									// Add color to results and change attribute
									context.findColor(defaultColorValue, true);
									cheerio(element).attr(
										prop,
										colorToString(defaultColorValue)
									);
									itemColors[prop] = defaultColorValue;
								} else {
									context.result.hasUnsetColor = true;
								}
							}
						}
					}
				}

				// Parse child elements
				let index = 0;
				const parseChildItem = () => {
					if (index >= item.children.length) {
						// Done
						return done();
					}

					const childItem = item.children[index];
					index++;
					if (!childItem.usedAsMask) {
						parseTreeItem(childItem, parseChildItem);
					} else {
						parseChildItem();
					}
				};
				parseChildItem();
			});
		});
	}

	// Parse tree, starting with <svg>
	parseTreeItem(tree, done);
}

/**
 * Find colors in icon
 *
 * Clean up icon before running this function to convert style to attributes using
 * cleanupInlineStyle() or cleanupSVG(), otherwise results might be inaccurate
 */
export function parseColors(
	svg: SVG,
	options: ParseColorsOptions = {}
): FindColorsResult {
	const callback = options.callback;

	// Init stuff
	const context = createContext(
		options,
		callback
			? (params, done) => {
					done(callback(...params));
			  }
			: void 0
	);

	// Parse colors in style synchronously
	parseSVGStyle(svg, (item) => {
		let isSync = true;
		let result: ParseSVGStyleCallbackResult;
		context.parseStyleItem(item, (value) => {
			if (!isSync) {
				throw new Error('parseStyleItem callback supposed to be sync');
			}
			result = value;
		});
		isSync = false;
		return result;
	});

	// Analyse SVG
	let isSync = true;
	analyseSVG(svg, context, () => {
		if (!isSync) {
			throw new Error('analyseSVG callback supposed to be sync');
		}
	});
	isSync = false;
	return context.result;
}

/**
 * Check if color is empty, such as 'none' or 'transparent'
 */
export function isEmptyColor(color: Color): boolean {
	const type = color.type;
	return type === 'none' || type === 'transparent';
}

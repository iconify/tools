import { Color } from '@iconify/utils/lib/colors/types';
import { isEmptyColor, parseColorsSync } from '../colors/parse';
import { SVG } from '../svg';
import { iconToHTML, parseSVGContent, splitSVGDefs } from '@iconify/utils';

// Callback to check if color matches
type ColorCallback = (value: string, color: Color | null) => boolean;

type ColorCheck = string | string[] | ColorCallback;

interface SVGToMaskOptions {
	// Color to use for final shape
	color?: string;

	// Solid color(s), lower case
	solid?: ColorCheck;

	// Transparent color(s), lower case
	transparent?: ColorCheck;

	// Custom colors, returns opacity (0-1) or color value
	custom?: (
		value: string,
		color: Color | null
	) => string | number | undefined;

	// Force mask if nothing to mask
	force?: boolean;

	// Mask id
	id?: string;
}

const defaultBlackColors: string[] = ['black', '#000', '#000000'];
const defaultWhiteColors: string[] = ['white', '#fff', '#ffffff'];

const defaultOptions: Required<Omit<SVGToMaskOptions, 'custom'>> = {
	color: 'currentColor',
	solid: [...defaultBlackColors, 'currentcolor'],
	transparent: defaultWhiteColors,
	force: false,
	id: 'mask',
};

/**
 * Converts SVG to mask
 *
 * Fixes badly designed icons, which use white shape where icon supposed to be transparent
 */
export function convertSVGToMask(
	svg: SVG,
	options: SVGToMaskOptions = {}
): boolean {
	const props = {
		...defaultOptions,
		...options,
	};

	// Function to check color
	const check = (
		test: ColorCheck,
		value: string,
		color: Color | null
	): boolean => {
		if (typeof test === 'string') {
			return value.toLowerCase() === test;
		}
		if (test instanceof Array) {
			return test.includes(value.toLowerCase());
		}
		return test(value, color);
	};

	// Change palette
	let foundSolid = false;
	let foundTransparent = false;
	let failed = false;
	let hasCustomValue = false;
	const backup = svg.toString();
	parseColorsSync(svg, {
		callback: (attr, colorStr, color) => {
			if (!color || isEmptyColor(color)) {
				// Do not change it
				return colorStr;
			}

			// Check if color is solid
			if (check(props.solid, colorStr, color)) {
				// Solid
				foundSolid = true;
				return '#fff';
			}
			if (check(props.transparent, colorStr, color)) {
				// Transparent
				foundTransparent = true;
				return '#000';
			}
			if (props.custom) {
				let customValue = props.custom(colorStr.toLowerCase(), color);
				if (typeof customValue === 'number') {
					// Convert to hex color
					const num = Math.max(
						Math.min(Math.round(customValue * 255), 255),
						0
					);
					let str = num.toString(16);
					if (str.length < 2) {
						str = '0' + str;
					}
					if (str[0] === str[1]) {
						str = str[0];
					}
					customValue = '#' + str + str + str;
				}
				if (typeof customValue === 'string') {
					// Mark as found, return value
					if (defaultBlackColors.includes(customValue)) {
						foundSolid = true;
					} else if (defaultWhiteColors.includes(customValue)) {
						foundTransparent = true;
					} else {
						hasCustomValue = true;
					}
					return customValue;
				}
			}

			failed = true;
			console.warn('Unexpected color:', colorStr);
			return color;
		},
	});

	// Check if there are transparent elements
	const hasColors = hasCustomValue || (foundSolid && foundTransparent);
	if (failed || (!hasColors && !props.force)) {
		// Failed or nothing to mask
		svg.load(backup);
		return false;
	}

	// Apply mask
	const parsed = parseSVGContent(svg.toString());
	if (!parsed) {
		// Failed
		return false;
	}
	const { defs, content } = splitSVGDefs(parsed.body);
	const newBody = `<defs>${defs}<mask id="${
		props.id
	}">${content}</mask></defs><rect mask="url(#${props.id})" ${
		svg.viewBox.left ? `x=${svg.viewBox.left} ` : ''
	}${svg.viewBox.top ? `y=${svg.viewBox.top} ` : ''}width="${
		svg.viewBox.width
	}" height="${svg.viewBox.height}" fill="${props.color}" />`;

	// Load SVG
	const newContent = iconToHTML(newBody, parsed.attribs);
	svg.load(newContent);
	return true;
}

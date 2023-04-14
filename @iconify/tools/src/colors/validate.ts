import { colorToString } from '@iconify/utils/lib/colors';
import type { SVG } from '../svg/index';
import {
	parseColors,
	ParseColorsOptions,
	parseColorsSync,
	ParseColorsSyncOptions,
} from './parse';
import type { FindColorsResult } from './parse';

/**
 * Check palette
 */
function checkPalette(palette: FindColorsResult, expectMonotone: boolean) {
	palette.colors.forEach((color) => {
		if (typeof color === 'string') {
			throw new Error('Unexpected color: ' + color);
		}
		switch (color.type) {
			case 'none':
			case 'transparent':
				return;

			// Monotone
			case 'current':
				if (!expectMonotone) {
					throw new Error(
						'Unexpected color: ' + colorToString(color)
					);
				}
				return;

			// Palette
			case 'rgb':
			case 'hsl':
				if (expectMonotone) {
					throw new Error(
						'Unexpected color: ' + colorToString(color)
					);
				}
				return;

			default:
				// Allow url()
				if (color.type !== 'function' || color.func !== 'url') {
					// Do not allow other colors
					throw new Error(
						'Unexpected color: ' + colorToString(color)
					);
				}
		}
	});
}

/**
 * Validate colors in icon
 *
 * If icon is monotone,
 *
 * Throws exception on error
 */
export async function validateColors(
	svg: SVG,
	expectMonotone: boolean,
	options?: ParseColorsOptions
): Promise<FindColorsResult> {
	// Parse colors
	const palette = await parseColors(svg, options);

	// Check palette
	checkPalette(palette, expectMonotone);
	return palette;
}

/**
 * Validate colors in icon, synchronous version
 *
 * If icon is monotone,
 *
 * Throws exception on error
 */
export function validateColorsSync(
	svg: SVG,
	expectMonotone: boolean,
	options?: ParseColorsSyncOptions
): FindColorsResult {
	// Parse colors
	const palette = parseColorsSync(svg, options);

	// Check palette
	checkPalette(palette, expectMonotone);
	return palette;
}

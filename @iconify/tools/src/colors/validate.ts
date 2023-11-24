import { colorToString } from '@iconify/utils/lib/colors';
import type { SVG } from '../svg/index';
import { parseColors, ParseColorsOptions } from './parse';
import type { FindColorsResult } from './parse';

/**
 * Validate colors in icon
 *
 * If icon is monotone,
 *
 * Throws exception on error
 */
export function validateColors(
	svg: SVG,
	expectMonotone: boolean,
	options?: ParseColorsOptions
): FindColorsResult {
	// Parse colors
	const palette = parseColors(svg, options);

	// Check palette
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

	return palette;
}

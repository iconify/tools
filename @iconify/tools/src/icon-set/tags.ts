import { defaultIconDimensions } from '@iconify/utils/lib/icon/defaults';
import type { IconSet } from '.';
import { detectIconSetPalette } from '../colors/detect';

// Palette
export const paletteTags = {
	monotone: 'Monotone',
	palette: 'Has Colors',
};

// Icon size
export const sizeTags = {
	square: 'Square',
	gridPrefix: 'Grid: ',
	heightPrefix: 'Height: ',
};

/**
 * Add tags to icon set
 *
 * @deprecated
 */
export function addTagsToIconSet(
	iconSet: IconSet,
	customTags?: string[]
): string[] {
	const info = iconSet.info;
	const tags: string[] = [];

	// Find all icons to check
	const iconNames = Object.keys(iconSet.entries).filter((key) => {
		const item = iconSet.entries[key];
		if (item.type !== 'icon') {
			return false;
		}
		if (item.props.hidden) {
			return false;
		}
		return true;
	});

	if (iconNames.length) {
		// Palette
		let hasPalette: boolean | null | undefined = info?.palette;
		if (hasPalette === undefined) {
			hasPalette = detectIconSetPalette(iconSet);
		}

		if (hasPalette === true) {
			tags.push(paletteTags.palette);
		}
		if (hasPalette === false) {
			tags.push(paletteTags.monotone);
		}

		// Grid / height
		let isSquare = true;
		let height: number | undefined | null;

		for (let i = 0; i < iconNames.length; i++) {
			const icon = iconSet.entries[iconNames[i]];
			if (icon.type !== 'icon') {
				continue;
			}
			const iconProps = icon.props;
			const iconWidth = iconProps.width || defaultIconDimensions.width;
			const iconHeight = iconProps.height || defaultIconDimensions.height;

			// Check if icon is square
			if (isSquare && iconWidth !== iconHeight) {
				isSquare = false;
			}

			// Check grid
			if (height === undefined) {
				height = iconHeight;
			} else if (height && iconHeight !== height) {
				// Failed
				height = null;
			}

			// Check for failure
			if (!height && !isSquare) {
				break;
			}
		}

		if (height && Math.round(height) === height) {
			// Grid
			tags.push(
				(isSquare ? sizeTags.gridPrefix : sizeTags.heightPrefix) +
					height.toString()
			);
		}
		if (isSquare) {
			tags.push(sizeTags.square);
		}
	}

	// Merge custom tags, assign to info
	const result = tags.concat(customTags || []);
	if (info) {
		info.tags = result;
	}
	return result;
}

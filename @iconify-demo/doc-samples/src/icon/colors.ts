import { compareColors, stringToColor } from '@iconify/utils/lib/colors';
import { IconSet, parseColors, isEmptyColor } from '@iconify/tools';

const iconSet = new IconSet({
	prefix: 'codicon',
	icons: {
		'add': {
			body: '<path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z"/>',
		},
		'debug-pause': {
			body: '<path d="M4.5 3H6v10H4.5V3zm7 0v10H10V3h1.5z" fill="#000"/>',
			hidden: true,
		},
		'triangle-left': {
			body: '<path d="M10.44 2l.56.413v11.194l-.54.393L5 8.373v-.827L10.44 2z" fill="#000"/>',
		},
	},
	aliases: {
		'plus': {
			parent: 'add',
		},
		'triangle-right': {
			parent: 'triangle-left',
			hFlip: true,
		},
	},
});

// Parse all icons in icon set
iconSet.forEach((name, type) => {
	if (type !== 'icon') {
		// Ignore aliases and variations: they inherit content from parent icon, so there is nothing to change
		return;
	}

	// Get icon as SVG class instance
	const svg = iconSet.toSVG(name);
	if (svg) {
		// Parse colors in SVG instance
		parseColors(svg, {
			// Change default color to 'currentColor'
			defaultColor: 'currentColor',

			// Callback to parse each color
			callback: (attr, colorStr, color) => {
				if (!color) {
					// color === null, so color cannot be parsed
					// Return colorStr to keep old value
					return colorStr;
				}

				if (isEmptyColor(color)) {
					// Color is empty: 'none' or 'transparent'
					// Return color object to keep old value
					return color;
				}

				// Black color: change to 'currentColor'
				if (compareColors(color, stringToColor('black')!)) {
					return 'currentColor';
				}

				// White color: belongs to white background rectangle: remove rectangle
				if (compareColors(color, stringToColor('white')!)) {
					return 'remove';
				}

				// Unexpected color. Add code to check for it
				throw new Error(
					`Unexpected color "${colorStr}" in attribute ${attr}`
				);
			},
		});

		// Update icon in icon set
		iconSet.fromSVG(name, svg);
	}
});

// Export icon set
console.log(iconSet.export());

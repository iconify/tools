import { blankIconSet, parseColors, isEmptyColor } from '@iconify/tools';

// Wrap in async anonymous function to allow 'await'
(async () => {
	// Create icon set, add one icon
	const iconSet = blankIconSet('');
	iconSet.setIcon('add', {
		body: '<path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z"/>',
	});

	// Export icon
	const svg = iconSet.toSVG('add');
	if (!svg) {
		throw new Error('Icon is missing');
	}

	// Set fill to 'currentColor'
	await parseColors(svg, {
		// If a shape uses default color (used in this example), change it to 'currentColor'.
		defaultColor: 'currentColor',

		// Callback to change colors. Not called in this example because there are no colors in sample icon.
		callback: (attr, colorStr, color) => {
			// color === null -> color cannot be parsed -> return colorStr
			// isEmptyColor() -> checks if color is empty: 'none' or 'transparent' -> return color object
			//		 without changes (though color string can also be returned, but using object is faster)
			// for everything else return 'currentColor'
			return !color ? colorStr : isEmptyColor(color) ? color : 'currentColor';
		},
	});

	// Update icon, used in example above that uses 'iconSet.toString()'
	iconSet.fromSVG('add', svg);

	// Log to show icon (two identical ways to do it)
	console.log(svg.toString());
	console.log(iconSet.toString('add'));
})();

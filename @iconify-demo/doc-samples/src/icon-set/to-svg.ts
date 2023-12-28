import { blankIconSet, parseColors, isEmptyColor } from '@iconify/tools';

// Create an icon set, add one icon
const iconSet = blankIconSet('');
iconSet.setIcon('add', {
	body: '<path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z"/>',
});

// Export icon to SVG class instance
// Note: SVG instance is not attached to icon set, so it is not updated automatically (see code below).
const svg = iconSet.toSVG('add');
if (!svg) {
	throw new Error('Icon is missing');
}

// Set fill to 'currentColor'
parseColors(svg, {
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

// Icon instance is not attached to icon set, so it is not updated automatically.
// Update icon in icon set
iconSet.fromSVG('add', svg);

// Log to show icon (two ways to do it, one from icon set, one from icon instance)
console.log(svg.toString());
console.log(iconSet.toString('add'));

iconSet.forEach(async (name, type) => {
	if (type !== 'icon') {
		// Ignore aliases and variations: they inherit content from parent icon, so there is nothing to change
		return;
	}

	const svg = iconSet.toSVG(name);
	if (svg) {
		// Change colors to red
		parseColors(svg, {
			defaultColor: 'red',
			callback: (attr, colorStr, color) => {
				return !color || isEmptyColor(color) ? colorStr : 'red';
			},
		});

		// Update icon from SVG instance
		iconSet.fromSVG(name, svg);
	}
});

// The rest of code here

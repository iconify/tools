import { IconSet, cleanupSVG, parseColors, isEmptyColor } from '@iconify/tools';

const iconSet = new IconSet({
	prefix: 'codicon',
	icons: {
		'add': {
			body: '<g fill="currentColor"><path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z"/></g>',
		},
		'debug-pause': {
			body: '<g fill="currentColor"><path d="M4.5 3H6v10H4.5V3zm7 0v10H10V3h1.5z"/></g>',
			hidden: true,
		},
		'triangle-left': {
			body: '<g fill="currentColor"><path d="M10.44 2l.56.413v11.194l-.54.393L5 8.373v-.827L10.44 2z"/></g>',
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

// List icons and variations
// [ 'add', 'debug-pause', 'triangle-left', 'triangle-right' ]
console.log(iconSet.list());

// List everything
// [ 'add', 'debug-pause', 'triangle-left', 'plus', 'triangle-right' ]
console.log(iconSet.list(['icon', 'variation', 'alias']));

// Icons only
// [ 'add', 'debug-pause', 'triangle-left' ]
console.log(iconSet.list(['icon']));

// Function can also be used to parse all icons in icon set, though `forEach()` is a better choice for this code
const icons = iconSet.list();
for (let i = 0; i < icons.length; i++) {
	const name = icons[i];
	const svg = iconSet.toSVG(name);
	if (svg) {
		// Clean up icon
		try {
			cleanupSVG(svg);
		} catch (err) {
			// Something went wrong: remove icon
			iconSet.remove(name);
			continue;
		}

		// Change colors to red
		parseColors(svg, {
			defaultColor: 'red',
			callback: (attr, colorStr, color) => {
				return !color || isEmptyColor(color) ? colorStr : 'red';
			},
		});

		// Update code
		iconSet.fromSVG(name, svg);
	}
}

// Export updated icon set
console.log(iconSet.export());

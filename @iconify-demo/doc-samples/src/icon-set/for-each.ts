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

// Synchronous example: renaming all icons
console.log('Starting synchronous forEach()');
iconSet.forEach((name) => {
	iconSet.rename(name, 'renamed-' + name);
	console.log(`Renaming: ${name}`);
});
console.log('Completed synchronous forEach()');

// Async example: cleaning up icons.
// Wrap code in anonymous async function for asynchronous use case.
console.log('Starting async forEach()');
(async () => {
	await iconSet.forEach(async (name, type) => {
		if (type !== 'icon') {
			// Ignore aliases and variations: they inherit content from parent icon, so there is nothing to change
			return;
		}

		const svg = iconSet.toSVG(name);
		if (svg) {
			// Clean up icon
			console.log(`Cleaning up: ${name}`);
			try {
				cleanupSVG(svg);
			} catch (err) {
				// Something went wrong: remove icon
				iconSet.remove(name);
				return;
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
	});

	console.log('Completed async forEach()');
})();

console.log(
	'End of code... (this code is executed before icons are cleaned up, this is why async anonymous function is needed)'
);

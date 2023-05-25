import { IconSet } from '@iconify/tools';

const iconSet = new IconSet({
	prefix: 'codicon',
	icons: {
		// Counted
		'add': {
			body: '<g fill="currentColor"><path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z"/></g>',
		},
		// Ignored: hidden
		'debug-pause': {
			body: '<g fill="currentColor"><path d="M4.5 3H6v10H4.5V3zm7 0v10H10V3h1.5z"/></g>',
			hidden: true,
		},
		// Counted
		'triangle-left': {
			body: '<g fill="currentColor"><path d="M10.44 2l.56.413v11.194l-.54.393L5 8.373v-.827L10.44 2z"/></g>',
		},
	},
	aliases: {
		// Ignored: alias
		'plus': {
			parent: 'add',
		},
		// Counted: variation
		'triangle-right': {
			parent: 'triangle-left',
			hFlip: true,
		},
	},
});

// Count icons: returns 3
console.log(iconSet.count());

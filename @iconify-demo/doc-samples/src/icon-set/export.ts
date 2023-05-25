import { blankIconSet } from '@iconify/tools';

// Create icon set, add few icons
const iconSet = blankIconSet('test-prefix');
iconSet.setIcon('add', {
	body: '<path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z"/>',
});
iconSet.setIcon('triangle-left', {
	body: '<g fill="currentColor"><path d="M10.44 2l.56.413v11.194l-.54.393L5 8.373v-.827L10.44 2z"/></g>',
});
iconSet.setVariation('triangle-right', 'triangle-left', {
	hFlip: true,
});

// Set information
iconSet.info = {
	name: 'Test',
	author: {
		name: 'Me',
	},
	license: {
		title: 'MIT',
	},
};

// Export icon set
const data = iconSet.export();
console.log(JSON.stringify(data, null, '\t'));

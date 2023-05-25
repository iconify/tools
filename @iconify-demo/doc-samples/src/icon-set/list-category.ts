import { IconSet } from '@iconify/tools';

// Import icon set
const iconSet = new IconSet({
	prefix: 'carbon',
	icons: {
		'add': {
			body: '<path d="M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z" fill="currentColor"/>',
		},
		'arrow-down': {
			body: '<path d="M24.59 16.59L17 24.17V4h-2v20.17l-7.59-7.58L6 18l10 10l10-10l-1.41-1.41z" fill="currentColor"/>',
		},
		'arrow-left': {
			body: '<path d="M14 26l1.41-1.41L7.83 17H28v-2H7.83l7.58-7.59L14 6L4 16l10 10z" fill="currentColor"/>',
		},
		'back-to-top': {
			body: '<path d="M16 14L6 24l1.4 1.4l8.6-8.6l8.6 8.6L26 24z" fill="currentColor"/><path d="M4 8h24v2H4z" fill="currentColor"/>',
		},
		'bookmark-filled': {
			body: '<path d="M24 2H8a2 2 0 0 0-2 2v26l10-5.054L26 30V4a2 2 0 0 0-2-2z" fill="currentColor"/>',
		},
		'caret-down': {
			body: '<path d="M24 12l-8 10l-8-10z" fill="currentColor"/>',
		},
		'caret-left': {
			body: '<path d="M20 24l-10-8l10-8z" fill="currentColor"/>',
		},
	},
	aliases: {
		'plus': {
			parent: 'add',
		},
		'arrow-up': {
			parent: 'arrow-down',
			vFlip: true,
		},
		'arrow-right': {
			parent: 'arrow-left',
			hFlip: true,
		},
		'caret-up': {
			parent: 'caret-down',
			vFlip: true,
		},
		'caret-right': {
			parent: 'caret-left',
			hFlip: true,
		},
	},
	width: 32,
	height: 32,
});

// Add few categories
iconSet.toggleCategory('arrow-down', 'Arrows', true);
iconSet.toggleCategory('arrow-left', 'Arrows', true);
iconSet.toggleCategory('caret-down', 'Arrows', true);
iconSet.toggleCategory('caret-left', 'Arrows', true);
iconSet.toggleCategory('bookmark-filled', 'Bookmarks', true);
iconSet.toggleCategory('bookmark-filled', 'Filled', true);

// List icons in category
// [ 'arrow-down', 'arrow-left', 'caret-down', 'caret-left' ]
console.log(iconSet.listCategory('Arrows'));

// Rename category using `categories` property
iconSet.categories.forEach((item) => {
	if (item.title === 'Arrows') {
		item.title = 'Simple Icons';
	}
});

// List icons in category (no longer exists)
// null
console.log(iconSet.listCategory('Arrows'));

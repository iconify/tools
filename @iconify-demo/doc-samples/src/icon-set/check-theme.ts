import { IconSet } from '@iconify/tools';

// Import icon set
const iconSet = new IconSet({
	prefix: 'carbon',
	icons: {
		'add': {
			body: '<path d="M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z" fill="currentColor"/>',
		},
		'arrow-down-regular': {
			body: '<path d="M24.59 16.59L17 24.17V4h-2v20.17l-7.59-7.58L6 18l10 10l10-10l-1.41-1.41z" fill="currentColor"/>',
		},
		'arrow-left-regular': {
			body: '<path d="M14 26l1.41-1.41L7.83 17H28v-2H7.83l7.58-7.59L14 6L4 16l10 10z" fill="currentColor"/>',
		},
		'back-to-top-regular': {
			body: '<path d="M16 14L6 24l1.4 1.4l8.6-8.6l8.6 8.6L26 24z" fill="currentColor"/><path d="M4 8h24v2H4z" fill="currentColor"/>',
		},
		'bookmark-filled': {
			body: '<path d="M24 2H8a2 2 0 0 0-2 2v26l10-5.054L26 30V4a2 2 0 0 0-2-2z" fill="currentColor"/>',
		},
		'caret-down-regular': {
			body: '<path d="M24 12l-8 10l-8-10z" fill="currentColor"/>',
		},
		'caret-left-regular': {
			body: '<path d="M20 24l-10-8l10-8z" fill="currentColor"/>',
		},
	},
	aliases: {
		'add-regular': {
			parent: 'add',
		},
		'arrow-up-regular': {
			parent: 'arrow-down-regular',
			vFlip: true,
		},
		'arrow-right-regular': {
			parent: 'arrow-left-regular',
			hFlip: true,
		},
		'caret-up-regular': {
			parent: 'caret-down-regular',
			vFlip: true,
		},
		'caret-right-regular': {
			parent: 'caret-left-regular',
			hFlip: true,
		},
	},
	width: 32,
	height: 32,
	prefixes: {
		arrow: 'Arrows',
		caret: 'Carets',
	},
	suffixes: {
		'filled': 'Filled',
		'regular': 'Regular',
		'': 'Other',
	},
});

// Check all prefixes
console.log(iconSet.checkTheme(true));

// Check all suffixes
console.log(iconSet.checkTheme(false));

import { IconSet } from '@iconify/tools';

// Import icon set
const iconSet = new IconSet({
	prefix: 'carbon',
	icons: {
		'add': {
			body: '<path d="M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z" fill="currentColor"/>',
		},
		'arrow-left': {
			body: '<path d="M14 26l1.41-1.41L7.83 17H28v-2H7.83l7.58-7.59L14 6L4 16l10 10z" fill="currentColor"/>',
		},
	},
	aliases: {
		'plus': {
			parent: 'add',
		},
		'arrow-right': {
			parent: 'arrow-left',
			hFlip: true,
		},
	},
	width: 32,
	height: 32,
});

// Rename 'add' to 'plus'
iconSet.rename('add', 'plus');

// Rename 'arrow-left' to 'arrow', also changes 'parent' property in 'arrow-right'
iconSet.rename('arrow-left', 'arrow');

// Export
console.log(iconSet.export());

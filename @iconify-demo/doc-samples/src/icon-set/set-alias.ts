import { blankIconSet } from '@iconify/tools';

// Create icon set, add few icons
const iconSet = blankIconSet('test-prefix');
iconSet.setIcon('add', {
	body: '<path d="M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z" fill="currentColor"/>',
	width: 32,
	height: 32,
});

iconSet.setIcon('caret-down', {
	body: '<path d="M24 12l-8 10l-8-10z" fill="currentColor"/>',
	width: 32,
	height: 32,
});
iconSet.setVariation('caret-up', 'caret-down', {
	vFlip: true,
});

iconSet.setAlias('plus', 'add');

// Export icon set
const data = iconSet.export();
console.log(JSON.stringify(data, null, '\t'));

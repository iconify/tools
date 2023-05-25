import { blankIconSet } from '@iconify/tools';

// Create icon set, add few icons and characters
const iconSet = blankIconSet('test-prefix');

iconSet.setIcon('add', {
	body: '<path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z"/>',
});
iconSet.toggleCharacter('add', 'f001', true);

iconSet.setIcon('triangle-left', {
	body: '<g fill="currentColor"><path d="M10.44 2l.56.413v11.194l-.54.393L5 8.373v-.827L10.44 2z"/></g>',
});
iconSet.toggleCharacter('triangle-left', 'f002', true);

iconSet.setVariation('triangle-right', 'triangle-left', {
	hFlip: true,
});
iconSet.toggleCharacter('triangle-right', 'f003', true);

// Set character for icon that does not exist (will fail)
iconSet.toggleCharacter('whatever', 'f005', true);

// Export characters map
console.log(iconSet.chars());

// Characters map is also exported in export():
console.log(iconSet.export());

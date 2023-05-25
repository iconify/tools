import { blankIconSet } from '@iconify/tools';

const iconSet = blankIconSet('');
iconSet.setIcon('add', {
	body: '<g fill="currentColor"><path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z"/></g>',
});

// Export icon
console.log(iconSet.toString('add'));

import { IconSet, mergeIconSets } from '@iconify/tools';

// Merge 2 icon sets
const merged = mergeIconSets(
	new IconSet({
		// Prefix, info, categories, characters are not copied from old icon set
		prefix: 'foo',
		icons: {
			'chrome-maximize': {
				body: '<g fill="currentColor"><path d="M3 3v10h10V3H3zm9 9H4V4h8v8z"/></g>',
			},
			'chrome-minimize': {
				body: '<g fill="currentColor"><path d="M14 8v1H3V8h11z"/></g>',
			},
		},
		width: 24,
		height: 24,
	}),
	new IconSet({
		prefix: 'bar',
		icons: {
			remove: {
				body: '<g fill="currentColor"><path d="M15 8H1V7h14v1z"/></g>',
			},
		},
	})
);

// Log merged icon set
console.log(merged.export());

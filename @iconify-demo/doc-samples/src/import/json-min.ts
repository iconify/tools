import { promises as fs } from 'fs';
import { IconSet, cleanupSVG } from '@iconify/tools';
import { validateIconSet } from '@iconify/utils';

(async () => {
	// Read data, parse JSON
	const rawData = JSON.parse(
		await fs.readFile('files/arty-animated.svg', 'utf8')
	);

	// Validate icon set
	const validatedData = validateIconSet(rawData);

	// Create new IconSet instance
	const iconSet = new IconSet(validatedData);

	// Clean up icons
	iconSet.forEachSync(
		(name) => {
			const svg = iconSet.toSVG(name);
			if (!svg) {
				// Bad icon
				iconSet.remove(name);
				return;
			}

			// Wrap in try...catch to catch errors
			try {
				// Clean up and validate
				cleanupSVG(svg);

				// Update icon data in icon set
				iconSet.fromSVG(name, svg);
			} catch (err) {
				console.error(`Error parsing ${name}:`, err);
				iconSet.remove(name);
			}
		},
		['icon']
	);

	// Done. Do other stuff...
})();

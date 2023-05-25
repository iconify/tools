import { importFromFigma, parseColors } from '@iconify/tools';

/**
 * Important: set 'token' option before running this code. Token is mandatory.
 *
 * You can get your API token from Figma account page. Do not share your API token with anyone!
 */

// Cache directory. Used to avoid retrieving same files multiple times.
const cacheDir = 'cache/quill';

(async () => {
	const result = await importFromFigma({
		// Icon set prefix, used for creating icon set instance.
		prefix: 'quill',

		// Community link: https://www.figma.com/community/file/1034432054377533052/Quill-Iconset
		// Community link does not have document ID and cannot be used. To parse a community file,
		// either copy link from file (if you are author) or duplicate it.

		// Figma document. Get document id by clicking "Share" button when editing it,
		// click "Copy link" and get id from link.
		file: '9lvc7JGhqpNnpF3OK9kjnG',

		// Figma API token. You can get it from your Figma account settings.
		token: '', // process.env.FIGMA_API_TOKEN,

		// If enabled, will stop import process if Figma document has not been updated since last parse.
		// ifModifiedSince: true,

		// Directory for cache
		cacheDir,

		// Depth of layers tree where icons are located.
		// 2 = page -> icon
		// 3 = page -> frame/group -> icon
		depth: 3,

		// Function to filter parent layers. Used to avoid scanning pages and nodes
		// that do not contain icons for export.
		filterParentNode: (nodes) => {
			switch (nodes.length) {
				case 1: {
					// Page: 'Icons'
					const node = nodes[0];
					return node.name === 'Icons';
				}

				case 2: {
					// Frame: 'Regular'
					const node = nodes[1];
					return node.name === 'Regular';
				}
			}
			return false;
		},

		// Check if node is an icon. Returns icon name on success, null on failure.
		iconNameForNode: (node) => {
			if (
				// Icons are stored after 2 parents: page -> container frame -> icon
				node.parents.length !== 2 ||
				// Icons use frames
				node.type !== 'FRAME' ||
				// Icon should be 32x32
				node.width !== 32 ||
				node.height !== 32
			) {
				return null;
			}

			// Return node name as keyword for icon
			return node.name;
		},
	});

	/*
	// 'not_modified' can be returned only if 'ifModifiedSince' option was set, so uncomment ifModifiedSince option
	// and this code, otherwise TypeScript will complain that result cannot be 'not_modified'
	if (result === 'not_modified') {
		// This result is possible if ifModifiedSince option is set
		console.log('Not modified');
		return;
	}
	*/

	const iconSet = result.iconSet;

	// Check colors in icons
	await iconSet.forEach(async (name) => {
		const svg = iconSet.toSVG(name);
		if (!svg) {
			return;
		}

		await parseColors(svg, {
			// Change default color to 'currentColor'
			defaultColor: 'currentColor',

			// Callback to parse each color
			callback: (attr, colorStr) => {
				switch (colorStr.toLowerCase()) {
					case '#2e4454':
						// Change to currentColor
						return 'currentColor';

					case 'none':
						return colorStr;
				}

				// Should not happen
				console.error(`Unexpected ${attr} "${colorStr}" in ${name}`);
				return colorStr;
			},
		});

		// Update icon in icon set
		iconSet.fromSVG(name, svg);
	});

	// Export icon set in IconifyJSON format
	console.log(iconSet.export());
	console.log('Found', iconSet.count(), 'icons');
})();

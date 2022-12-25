import { sveltekit } from '@sveltejs/kit/vite';
import { promises as fs } from 'fs';
import { compareColors, stringToColor } from '@iconify/utils/lib/colors';
import {
	SVG,
	cleanupSVG,
	parseColors,
	runSVGO,
	deOptimisePaths,
	importDirectory,
} from '@iconify/tools';
import Icons from 'unplugin-icons/vite';

const assetsRootDir = 'assets';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit(),
		Icons({
			compiler: 'svelte',
			customCollections: {
				// Load an entire icon set
				'svg-animated': async () => {
					// Load icons
					const iconSet = await importDirectory(
						assetsRootDir + '/svg-animated',
						{
							prefix: 'svg-animated',
						}
					);

					// Clean up each icon
					await iconSet.forEach(async (name) => {
						const svg = iconSet.toSVG(name);

						// Change color to `currentColor`
						const blackColor = stringToColor('black');

						await parseColors(svg, {
							defaultColor: 'currentColor',
							callback: (attr, colorStr, color) => {
								// console.log('Color:', colorStr, color);

								// Change black to 'currentColor'
								if (color && compareColors(color, blackColor)) {
									return 'currentColor';
								}

								switch (color?.type) {
									case 'none':
									case 'current':
										return color;
								}

								throw new Error(
									`Unexpected color "${colorStr}" in attribute ${attr}`
								);
							},
						});

						// Optimise, but do not change shapes because they are animated
						runSVGO(svg, {
							keepShapes: true,
						});

						// Update icon in icon set
						iconSet.fromSVG(name, svg);
					});

					// Export as IconifyJSON
					return iconSet.export();
				},

				// Load icon one by one on demand
				'svg-ion': async (name) => {
					// Load icon
					const filename = `${assetsRootDir}/svg-ion/${name}.svg`;
					const content = await fs.readFile(filename, 'utf8');
					const svg = new SVG(content);

					// Clean up icon
					await cleanupSVG(svg);

					// Change color to `currentColor`
					const blackColor = stringToColor('black');

					await parseColors(svg, {
						defaultColor: 'currentColor',
						callback: (attr, colorStr, color) => {
							// console.log('Color:', colorStr, color);

							// Change black to 'currentColor'
							if (color && compareColors(color, blackColor)) {
								return 'currentColor';
							}

							switch (color?.type) {
								case 'none':
								case 'current':
									return color;
							}

							throw new Error(
								`Unexpected color "${colorStr}" in attribute ${attr}`
							);
						},
					});

					// Optimise
					await runSVGO(svg);

					// Update paths for compatibility with old software
					await deOptimisePaths(svg);

					// Return icon
					// First parameter must be set to change height to '1em' !
					return svg.toMinifiedString({});
				},
			},
		}),
	],
};

export default config;

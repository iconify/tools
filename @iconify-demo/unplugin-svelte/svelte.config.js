import { promises as fs } from 'fs';
import { compareColors, stringToColor } from '@iconify/utils/lib/colors';
import {
	SVG,
	cleanupSVG,
	parseColors,
	runSVGO,
	deOptimisePaths,
} from '@iconify/tools';
import preprocess from 'svelte-preprocess';
import Icons from 'unplugin-icons/vite';

const assetsRootDir = 'assets';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),
	kit: {
		vite: {
			plugins: [
				Icons({
					compiler: 'svelte',
					customCollections: {
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
									if (
										color &&
										compareColors(color, blackColor)
									) {
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
		},
	},
};

export default config;

import { promises as fs } from 'node:fs';
import { defineConfig, presetIcons, presetUno } from 'unocss';
import { compareColors, stringToColor } from '@iconify/utils/lib/colors';
import type { IconSet } from '@iconify/tools';
import {
	deOptimisePaths,
	importDirectory,
	parseColors,
	runSVGO,
} from '@iconify/tools';
import type { CustomIconLoader } from '@iconify/utils/lib/loader/types';

/**
 * Load custom icon set
 */
function loadCustomIconSet(): CustomIconLoader {
	const promise = new Promise<IconSet>((resolve, reject) => {
		importDirectory('assets/svg', {
			prefix: 'svg',
		}).then((iconSet) => {
			iconSet
				.forEach(async (name) => {
					const svg = iconSet.toSVG(name)!;

					// Change color to `currentColor`
					const blackColor = stringToColor('black')!;

					await parseColors(svg, {
						defaultColor: 'currentColor',
						callback: (attr, colorStr, color) => {
							// console.log('Color:', colorStr, color);

							// Change black to 'currentColor'
							if (color && compareColors(color, blackColor))
								return 'currentColor';

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
					runSVGO(svg);

					// Update paths for compatibility with old software
					await deOptimisePaths(svg);

					// Update icon in icon set
					iconSet.fromSVG(name, svg);
				})
				.then(() => {
					resolve(iconSet);
				})
				.catch((err) => {
					reject(err);
				});
		});
	});

	return async (name) => {
		const iconSet = await promise;
		return iconSet.toSVG(name)?.toMinifiedString();
	};
}

/**
 * Create UnoCSS config
 */
export function createConfig({ strict = true, dev = true } = {}) {
	return defineConfig({
		envMode: dev ? 'dev' : 'build',
		theme: {
			fontFamily: {
				sans: "'Inter', sans-serif",
				mono: "'Fira Code', monospace",
			},
		},
		presets: [
			presetIcons({
				autoInstall: false,
				collections: {
					// Loading IconifyJSON data
					'test': async () => {
						const content = await fs.readFile(
							'assets/test.json',
							'utf8'
						);
						return JSON.parse(content);
					},

					// Loading icon set
					// Moved to a separate function to make it easier to understand and reuse it
					'custom-svg': loadCustomIconSet(),
				},
			}),
			presetUno(),
		],
		rules: [
			[
				'inline-icon',
				{
					'vertical-align': '-0.125em',
				},
			],
			[
				'icon16',
				{
					'font-size': '16px',
					'line-height': '1em',
				},
			],
			[
				'icon24',
				{
					'font-size': '24px',
					'line-height': '1em',
				},
			],
		],
	});
}

export default createConfig();

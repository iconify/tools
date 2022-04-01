import { promises as fs } from 'fs';
import { defineConfig, presetAttributify, presetUno } from 'unocss';
import presetIcons from '@unocss/preset-icons';
import transformerVariantGroup from '@unocss/transformer-variant-group';
import transformerDirectives from '@unocss/transformer-directives';

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
			presetAttributify({ strict }),
			presetIcons({
				autoInstall: true,
				collections: {
					test: async () => {
						const content = await fs.readFile(
							'assets/test.json',
							'utf8'
						);
						return JSON.parse(content);
					},
				},
			}),
			presetUno(),
		],
		transformers: [transformerVariantGroup(), transformerDirectives()],
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

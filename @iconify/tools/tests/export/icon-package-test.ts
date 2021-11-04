import { promises as fs } from 'fs';
import { exportIconPackage } from '../../lib/export/icon-package';
import { IconSet } from '../../lib/icon-set';
import { scanDirectory } from '../../lib/misc/scan';

// Check if file or directory exists
async function exists(filename: string): Promise<boolean> {
	try {
		const stat = await fs.lstat(filename);
		return stat.isFile() || stat.isDirectory();
	} catch (err) {
		return false;
	}
}

describe('Exporting to icon package', () => {
	test('Few icons', async () => {
		const targetDir = 'cache/export-icon-package-test';
		const iconSet = new IconSet({
			prefix: 'foo',
			icons: {
				maximize: {
					body: '<g fill="currentColor"><path d="M3 3v10h10V3H3zm9 9H4V4h8v8z"/></g>',
				},
				minimize: {
					body: '<g fill="currentColor"><path d="M14 8v1H3V8h11z"/></g>',
				},
			},
			aliases: {
				test: {
					parent: 'maximize',
				},
			},
			width: 24,
			height: 24,
		});

		// Clean directory
		try {
			await fs.rm(targetDir, {
				recursive: true,
				force: true,
			});
		} catch (err) {
			//
		}
		expect(await exists(targetDir)).toBe(false);

		// Export icon set
		await exportIconPackage(iconSet, {
			target: targetDir,
		});

		// Make sure directory exists and list files
		expect(await exists(targetDir)).toBe(true);
		const files = await scanDirectory(targetDir);
		files.sort((a, b) => a.localeCompare(b));
		expect(files).toEqual([
			'maximize.d.ts',
			'maximize.js',
			'minimize.d.ts',
			'minimize.js',
			'package.json',
			'test.d.ts',
			'test.js',
		]);

		// Check contents of .js files
		await iconSet.forEach(async (name) => {
			const content = await fs.readFile(
				`${targetDir}/${name}.js`,
				'utf8'
			);
			const data = iconSet.resolve(name);
			const expected =
				'const data = ' +
				JSON.stringify(data, null, '\t') +
				';\nexport default data;\n';
			expect(content).toBe(expected);
		});

		// Clean up
		await fs.rm(targetDir, {
			recursive: true,
			force: true,
		});
		expect(await exists(targetDir)).toBe(false);
	});

	test('CommonJS exports', async () => {
		const targetDir = 'cache/export-icon-package-cjs-test';
		const iconSet = new IconSet({
			prefix: 'foo',
			icons: {
				maximize: {
					body: '<g fill="currentColor"><path d="M3 3v10h10V3H3zm9 9H4V4h8v8z"/></g>',
				},
				minimize: {
					body: '<g fill="currentColor"><path d="M14 8v1H3V8h11z"/></g>',
				},
			},
			aliases: {
				test: {
					parent: 'maximize',
				},
			},
			width: 24,
			height: 24,
		});

		// Clean directory
		try {
			await fs.rm(targetDir, {
				recursive: true,
				force: true,
			});
		} catch (err) {
			//
		}
		expect(await exists(targetDir)).toBe(false);

		// Export icon set
		await exportIconPackage(iconSet, {
			target: targetDir,
			module: false,
		});

		// Make sure directory exists and list files
		expect(await exists(targetDir)).toBe(true);
		const files = await scanDirectory(targetDir);
		files.sort((a, b) => a.localeCompare(b));
		expect(files).toEqual([
			'maximize.d.ts',
			'maximize.js',
			'minimize.d.ts',
			'minimize.js',
			'package.json',
			'test.d.ts',
			'test.js',
		]);

		// Check contents of .js files
		await iconSet.forEach(async (name) => {
			const content = await fs.readFile(
				`${targetDir}/${name}.js`,
				'utf8'
			);
			const data = iconSet.resolve(name);
			const expected =
				'const data = ' +
				JSON.stringify(data, null, '\t') +
				';\nexports.__esModule = true;\nexports.default = data;\n';
			expect(content).toBe(expected);
		});

		// Clean up
		await fs.rm(targetDir, {
			recursive: true,
			force: true,
		});
		expect(await exists(targetDir)).toBe(false);
	});
});

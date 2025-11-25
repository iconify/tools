import { rm, lstat } from 'node:fs/promises';
import { exportToDirectory } from '../../src/export/directory.js';
import { IconSet } from '../../src/icon-set/index.js';
import { scanDirectory } from '../../src/misc/scan.js';

// Check if file or directory exists
async function exists(filename: string): Promise<boolean> {
	try {
		const stat = await lstat(filename);
		return stat.isFile() || stat.isDirectory();
	} catch {
		return false;
	}
}

describe('Exporting to directory', () => {
	test('Few icons', async () => {
		const targetDir = 'cache/export-dir-test';
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
			width: 24,
			height: 24,
		});

		// Clean directory
		try {
			await rm(targetDir, {
				recursive: true,
				force: true,
			});
		} catch {
			//
		}
		expect(await exists(targetDir)).toBe(false);

		// Export icon set
		await exportToDirectory(iconSet, {
			target: targetDir,
		});

		// Make sure directory exists and list files
		expect(await exists(targetDir)).toBe(true);
		const files = await scanDirectory(targetDir, (ext) => {
			expect(ext).toBe('.svg');
			return true;
		});

		expect(files).toEqual(['maximize.svg', 'minimize.svg']);

		// Clean up
		await rm(targetDir, {
			recursive: true,
			force: true,
		});
		expect(await exists(targetDir)).toBe(false);
	});

	test('Aliases and characters', async () => {
		const targetDir = 'cache/export-dir-test2';
		const iconSet = new IconSet({
			prefix: 'foo',
			icons: {
				'chrome-maximize': {
					body: '<g fill="currentColor"><path d="M3 3v10h10V3H3zm9 9H4V4h8v8z"/></g>',
				},
				'chrome-minimize': {
					body: '<g fill="currentColor"><path d="M14 8v1H3V8h11z"/></g>',
				},
			},
			aliases: {
				maximize: {
					parent: 'chrome-maximize',
				},
				minimize: {
					parent: 'chrome-minimize',
				},
				whatever: {
					parent: 'missing',
				},
			},
			width: 24,
			height: 24,
			chars: {
				f00: 'chrome-maximize',
				f01: 'maximize',
			},
		});

		// Clean directory
		try {
			await rm(targetDir, {
				recursive: true,
				force: true,
			});
		} catch {
			//
		}
		expect(await exists(targetDir)).toBe(false);

		// Export icon set
		await exportToDirectory(iconSet, {
			target: targetDir,
			includeChars: true,
		});

		// Make sure directory exists and list files
		expect(await exists(targetDir)).toBe(true);
		const files = await scanDirectory(targetDir, (ext) => {
			expect(ext).toBe('.svg');
			return true;
		});

		expect(files).toEqual([
			'chrome-maximize.svg',
			'chrome-minimize.svg',
			'f00.svg',
			'f01.svg',
			'maximize.svg',
			'minimize.svg',
		]);

		// Clean up
		await rm(targetDir, {
			recursive: true,
			force: true,
		});
		expect(await exists(targetDir)).toBe(false);
	});
});

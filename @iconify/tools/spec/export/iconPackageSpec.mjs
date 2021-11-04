import { promises as fs } from 'fs';
import { exportIconPackage } from '@iconify/tools/lib/export/icon-package';
import { IconSet } from '@iconify/tools/lib/icon-set';
import { scanDirectory } from '@iconify/tools/lib/misc/scan';

// Check if file or directory exists
async function exists(filename) {
	try {
		const stat = await fs.lstat(filename);
		return stat.isFile() || stat.isDirectory();
	} catch (err) {
		return false;
	}
}

describe('Exporting to icon package', () => {
	it('Few icons', async () => {
		const targetDir = 'cache/export-icon-package-spec';
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

		// Clean up
		await fs.rm(targetDir, {
			recursive: true,
			force: true,
		});
		expect(await exists(targetDir)).toBe(false);
	});
});

import { promises as fs } from 'fs';
import { exportToDirectory } from '@iconify/tools/lib/export/directory';
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

describe('Exporting to directory', () => {
	it('Few icons', async () => {
		const targetDir = 'cache/export-dir-spec';
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
			await fs.rm(targetDir, {
				recursive: true,
				force: true,
			});
		} catch (err) {
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
		await fs.rm(targetDir, {
			recursive: true,
			force: true,
		});
		expect(await exists(targetDir)).toBe(false);
	});
});

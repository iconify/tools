import { rm } from 'node:fs/promises';
import { unzip } from '../../src/download/helpers/unzip.js';
import { scanDirectory } from '../../src/misc/scan.js';

describe('Unzip', () => {
	test('Simple package', async () => {
		const targetDir = './cache/unzip';
		const source = './tests/fixtures/unzip.zip';

		// Clean target directory
		try {
			await rm(targetDir, { recursive: true, force: true });
		} catch {
			//
		}

		// Unzip archive
		await unzip(source, targetDir);

		// Scan directory
		const files = await scanDirectory(targetDir);
		expect(files).toEqual([
			'bpmn-trash.svg',
			'subdir1/refresh.svg',
			'subdir1/spin.svg',
		]);
	});
});

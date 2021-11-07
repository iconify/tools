import { compareDirectories } from '@iconify/tools/lib/misc/compare-dirs';

describe('Comparing directories', () => {
	const rootDir = 'tests/fixtures/compare1';

	it('Identical directories', async () => {
		expect(
			await compareDirectories(rootDir + '/original', rootDir + '/copy')
		).toBe(true);

		// Different versions
		expect(
			await compareDirectories(
				rootDir + '/original',
				rootDir + '/different-version'
			)
		).toBe(true);
	});

	it('Different directories', async () => {
		expect(
			await compareDirectories(
				rootDir + '/original',
				rootDir + '/extra-file'
			)
		).toBe(false);
		expect(
			await compareDirectories(
				rootDir + '/original',
				rootDir + '/missing-file'
			)
		).toBe(false);

		// Different spacing
		expect(
			await compareDirectories(
				rootDir + '/original',
				rootDir + '/formatted',
				{
					ignoreNewLine: false,
				}
			)
		).toBe(false);

		// Different versions
		expect(
			await compareDirectories(
				rootDir + '/original',
				rootDir + '/different-version',
				{
					ignoreVersions: false,
				}
			)
		).toBe(false);
	});
});

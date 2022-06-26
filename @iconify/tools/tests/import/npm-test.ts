import { promises as fs } from 'fs';
import {
	downloadNPMPackage,
	DownloadNPMPackageResult,
} from '../../lib/download/npm';
import { prepareDirectoryForExport } from '../../lib/export/helpers/prepare';

const target = 'cache/npm';

const testPackage = '@cyberalien/package-test';

interface TestVersions {
	tag?: string;
	version: string;
}
const testBranches: TestVersions[] = [
	{
		tag: 'latest',
		version: '1.0.1',
	},
	{
		tag: 'latest-v1',
		version: '1.0.0',
	},
];

const packageDir = '/package';

describe('Downloading NPM package', () => {
	beforeAll(async () => {
		// Remove old cache
		await prepareDirectoryForExport({
			target,
			cleanup: true,
		});
	});

	let lastResult: DownloadNPMPackageResult | 'not_modified';

	test('Downloading latest tag', async () => {
		const branch = testBranches[0];
		const result = await downloadNPMPackage({
			ifModifiedSince: true,
			package: testPackage,
			target,
		});
		const expectedResult: typeof result = {
			downloadType: 'npm',
			contentsDir: target + packageDir,
			rootDir: target,
			version: branch.version,
		};
		expect(result).toEqual(expectedResult);
		lastResult = result;

		// Check contents of package.json
		const packageContents = JSON.parse(
			await fs.readFile(target + packageDir + '/package.json', 'utf8')
		) as Record<string, unknown>;
		expect(packageContents.version).toBe(branch.version);
	});

	test('Downloading old version', async () => {
		const branch = testBranches[1];
		const result = await downloadNPMPackage({
			ifModifiedSince: true,
			package: testPackage,
			tag: branch.tag,
			target,
		});
		expect(result).not.toEqual(lastResult);

		const expectedResult: typeof result = {
			downloadType: 'npm',
			contentsDir: target + packageDir,
			rootDir: target,
			version: branch.version,
		};
		expect(result).toEqual(expectedResult);
		lastResult = result;

		// Check contents of package.json
		const packageContents = JSON.parse(
			await fs.readFile(target + packageDir + '/package.json', 'utf8')
		) as Record<string, unknown>;
		expect(packageContents.version).toBe(branch.version);
	});

	test('Checking not_modified', async () => {
		const branch = testBranches[1];

		// Use last result for ifModifiedSince
		const result = await downloadNPMPackage({
			ifModifiedSince: lastResult,
			package: testPackage,
			tag: branch.tag,
			target,
		});
		expect(result).toBe('not_modified');
	});

	test('Checking out latest tag again', async () => {
		const branch = testBranches[0];
		const result = await downloadNPMPackage({
			ifModifiedSince: lastResult,
			package: testPackage,
			tag: branch.tag,
			target,
		});
		expect(result).not.toEqual(lastResult);

		const expectedResult: typeof result = {
			downloadType: 'npm',
			contentsDir: target + packageDir,
			rootDir: target,
			version: branch.version,
		};
		expect(result).toEqual(expectedResult);
	});
});

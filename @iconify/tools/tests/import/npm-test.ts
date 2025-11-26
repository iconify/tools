import { readFile } from 'node:fs/promises';
import {
	downloadNPMPackage,
	DownloadNPMPackageResult,
} from '../../src/download/npm/index.js';
import { prepareDirectoryForExport } from '../../src/export/helpers/prepare.js';
import { isTestingRemote } from '../../src/tests/helpers.js';

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

// Wrap in test() or test.skip()
const runTest = isTestingRemote() ? test : test.skip;

describe('Downloading NPM package', () => {
	beforeAll(async () => {
		// Remove old cache
		await prepareDirectoryForExport({
			target,
			cleanup: true,
		});
	});

	let lastResult: DownloadNPMPackageResult | 'not_modified';

	async function downloadLatestTag() {
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
			await readFile(`${target}${packageDir}/package.json`, 'utf8')
		) as Record<string, unknown>;
		expect(packageContents.version).toBe(branch.version);
	}

	async function downloadOldVersion() {
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
			await readFile(`${target}${packageDir}/package.json`, 'utf8')
		) as Record<string, unknown>;
		expect(packageContents.version).toBe(branch.version);
	}

	async function checkNotModified() {
		const branch = testBranches[1];

		// Use last result for ifModifiedSince
		const result = await downloadNPMPackage({
			ifModifiedSince: lastResult,
			package: testPackage,
			tag: branch.tag,
			target,
		});
		expect(result).toBe('not_modified');
	}

	async function checkOutLatestTagAgain() {
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
	}

	runTest('Testing NPM package', async () => {
		// Run tests in sequence
		await downloadLatestTag();
		await downloadOldVersion();
		await checkNotModified();
		await checkOutLatestTagAgain();
	});
});

import { readFile } from 'node:fs/promises';
import {
	downloadGitRepo,
	DownloadGitRepoResult,
} from '../../src/download/git/index.js';
import { prepareDirectoryForExport } from '../../src/export/helpers/prepare.js';
import { isTestingRemote } from '../../src/tests/helpers.js';

const target = 'cache/git';

const testRepo = 'https://github.com/cyberalien/package-test.git';

interface TestBranches {
	branch: string;
	version: string;
	hash: string;
}
const testBranches: TestBranches[] = [
	{
		branch: 'main',
		version: '1.0.1',
		hash: '9e12899de13947c116ddd17f611c6f8426d65e3d',
	},
	{
		branch: 'v100',
		version: '1.0.0',
		hash: '11699621bcee18ac721a5347809b8f00736f7c8f',
	},
];

// Wrap in test() or test.skip()
const runTest = isTestingRemote() ? test : test.skip;

describe('Downloading Git repository', () => {
	beforeAll(async () => {
		// Remove old cache
		await prepareDirectoryForExport({
			target,
			cleanup: true,
		});
	});

	let lastResult: DownloadGitRepoResult | 'not_modified';

	runTest('Downloading main branch', async () => {
		const branch = testBranches[0];
		const result = await downloadGitRepo({
			ifModifiedSince: true,
			remote: testRepo,
			branch: branch.branch,
			target,
		});
		const expectedResult: typeof result = {
			downloadType: 'git',
			contentsDir: target,
			hash: branch.hash,
		};
		expect(result).toEqual(expectedResult);
		lastResult = result;

		// Check contents of package.json
		const packageContents = JSON.parse(
			await readFile(`${target}/package.json`, 'utf8')
		) as Record<string, unknown>;
		expect(packageContents.version).toBe(branch.version);
	});

	runTest('Downloading archive branch', async () => {
		const branch = testBranches[1];
		const result = await downloadGitRepo({
			ifModifiedSince: true,
			remote: testRepo,
			branch: branch.branch,
			target,
		});
		expect(result).not.toEqual(lastResult);

		const expectedResult: typeof result = {
			downloadType: 'git',
			contentsDir: target,
			hash: branch.hash,
		};
		expect(result).toEqual(expectedResult);
		lastResult = result;

		// Check contents of package.json
		const packageContents = JSON.parse(
			await readFile(`${target}/package.json`, 'utf8')
		) as Record<string, unknown>;
		expect(packageContents.version).toBe(branch.version);
	});

	runTest('Checking not_modified', async () => {
		const branch = testBranches[1];

		// Use last result for ifModifiedSince
		const result = await downloadGitRepo({
			ifModifiedSince: lastResult,
			remote: testRepo,
			branch: branch.branch,
			target,
		});
		expect(result).toBe('not_modified');
	});

	runTest('Checking out main branch again', async () => {
		const branch = testBranches[0];
		const result = await downloadGitRepo({
			ifModifiedSince: lastResult,
			remote: testRepo,
			branch: branch.branch,
			target,
		});
		expect(result).not.toEqual(lastResult);

		const expectedResult: typeof result = {
			downloadType: 'git',
			contentsDir: target,
			hash: branch.hash,
		};
		expect(result).toEqual(expectedResult);
	});
});

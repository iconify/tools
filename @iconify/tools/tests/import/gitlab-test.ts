import { readFile } from 'node:fs/promises';
import {
	downloadGitLabRepo,
	DownloadGitLabRepoResult,
} from '../../src/download/gitlab/index.js';
import { prepareDirectoryForExport } from '../../src/export/helpers/prepare.js';
import { isTestingRemote } from '../../src/tests/helpers.js';

const target = 'cache/gitlab';

const testProject = '33383621';

const tokenKey = 'GITLAB_TOKEN';
const token = process.env[tokenKey];

interface TestBranches {
	branch: string;
	version: string;
	hash: string;
	subdir: string;
}
const testBranches: TestBranches[] = [
	{
		branch: 'main',
		version: '1.0.1',
		hash: '9e12899de13947c116ddd17f611c6f8426d65e3d',
		subdir: 'package-test-9e12899de13947c116ddd17f611c6f8426d65e3d-9e12899de13947c116ddd17f611c6f8426d65e3d',
	},
	{
		branch: 'v100',
		version: '1.0.0',
		hash: '11699621bcee18ac721a5347809b8f00736f7c8f',
		subdir: 'package-test-11699621bcee18ac721a5347809b8f00736f7c8f-11699621bcee18ac721a5347809b8f00736f7c8f',
	},
];

// Wrap in test() or test.skip()
const runTest = isTestingRemote() && token ? test : test.skip;

describe('Downloading Git repository using GitLav API', () => {
	beforeAll(async () => {
		// Remove old cache
		await prepareDirectoryForExport({
			target,
			cleanup: true,
		});

		if (!token) {
			console.warn(
				`Cannot test downloadGitLabRepo() because API token is not provided. Set "${tokenKey}" environmental variable to test GitLab API.`
			);
			return;
		}
	});

	let lastResult: DownloadGitLabRepoResult | 'not_modified';

	runTest('Downloading main branch', async () => {
		if (!token) {
			return;
		}

		const branch = testBranches[0];
		const result = await downloadGitLabRepo({
			token,
			project: testProject,
			branch: branch.branch,
			target,
		});
		const expectedResult: typeof result = {
			downloadType: 'gitlab',
			rootDir: target,
			contentsDir: `${target}/${branch.subdir}`,
			hash: branch.hash,
		};
		expect(result).toEqual(expectedResult);
		lastResult = result;

		// Check contents of package.json
		const packageContents = JSON.parse(
			await readFile(`${target}/${branch.subdir}/package.json`, 'utf8')
		) as Record<string, unknown>;
		expect(packageContents.version).toBe(branch.version);
	});

	runTest('Downloading archive branch', async () => {
		if (!token) {
			return;
		}

		const branch = testBranches[1];
		const result = await downloadGitLabRepo({
			token,
			project: testProject,
			branch: branch.branch,
			target,
		});
		expect(result).not.toEqual(lastResult);

		const expectedResult: typeof result = {
			downloadType: 'gitlab',
			rootDir: target,
			contentsDir: `${target}/${branch.subdir}`,
			hash: branch.hash,
		};
		expect(result).toEqual(expectedResult);
		lastResult = result;

		// Check contents of package.json
		const packageContents = JSON.parse(
			await readFile(`${target}/${branch.subdir}/package.json`, 'utf8')
		) as Record<string, unknown>;
		expect(packageContents.version).toBe(branch.version);
	});

	runTest('Checking not_modified', async () => {
		if (!token) {
			return;
		}

		const branch = testBranches[1];

		// Use last result for ifModifiedSince
		const result = await downloadGitLabRepo({
			ifModifiedSince: lastResult,
			token,
			project: testProject,
			branch: branch.branch,
			target,
		});
		expect(result).toBe('not_modified');
	});

	runTest('Checking out main branch again', async () => {
		if (!token) {
			return;
		}

		const branch = testBranches[0];
		const result = await downloadGitLabRepo({
			ifModifiedSince: lastResult,
			token,
			project: testProject,
			branch: branch.branch,
			target,
		});
		expect(result).not.toEqual(lastResult);

		const expectedResult: typeof result = {
			downloadType: 'gitlab',
			rootDir: target,
			contentsDir: `${target}/${branch.subdir}`,
			hash: branch.hash,
		};
		expect(result).toEqual(expectedResult);
	});
});

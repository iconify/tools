import { readFile } from 'node:fs/promises';
import {
	downloadGitHubRepo,
	DownloadGitHubRepoResult,
} from '../../lib/download/github';
import { prepareDirectoryForExport } from '../../lib/export/helpers/prepare';
import { isTestingRemote } from '../../lib/tests/helpers';

const target = 'cache/github';

const testRepo = {
	user: 'cyberalien',
	repo: 'package-test',
};

const tokenKey = 'GITHUB_TOKEN';
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
		subdir: 'cyberalien-package-test-9e12899',
	},
	{
		branch: 'v100',
		version: '1.0.0',
		hash: '11699621bcee18ac721a5347809b8f00736f7c8f',
		subdir: 'cyberalien-package-test-1169962',
	},
];

// Wrap in test() or test.skip()
const runTest = isTestingRemote() && token ? test : test.skip;

describe('Downloading Git repository using GitHub API', () => {
	let lastResult: DownloadGitHubRepoResult | 'not_modified';

	beforeAll(async () => {
		// Remove old cache
		await prepareDirectoryForExport({
			target,
			cleanup: true,
		});

		// Check if tests should be run
		if (!token) {
			console.warn(
				`Cannot test downloadGitHubRepo() because API token is not provided. Set "${tokenKey}" environmental variable to test GitHub API.`
			);
		}
	});

	runTest('Downloading main branch', async () => {
		if (!token) {
			return;
		}

		const branch = testBranches[0];
		const result = await downloadGitHubRepo({
			token,
			user: testRepo.user,
			repo: testRepo.repo,
			branch: branch.branch,
			target,
		});
		const expectedResult: typeof result = {
			downloadType: 'github',
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
		const result = await downloadGitHubRepo({
			token,
			user: testRepo.user,
			repo: testRepo.repo,
			branch: branch.branch,
			target,
		});
		expect(result).not.toEqual(lastResult);

		const expectedResult: typeof result = {
			downloadType: 'github',
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
		const result = await downloadGitHubRepo({
			ifModifiedSince: lastResult,
			token,
			user: testRepo.user,
			repo: testRepo.repo,
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
		const result = await downloadGitHubRepo({
			ifModifiedSince: lastResult,
			token,
			user: testRepo.user,
			repo: testRepo.repo,
			branch: branch.branch,
			target,
		});
		expect(result).not.toEqual(lastResult);

		const expectedResult: typeof result = {
			downloadType: 'github',
			rootDir: target,
			contentsDir: `${target}/${branch.subdir}`,
			hash: branch.hash,
		};
		expect(result).toEqual(expectedResult);
	});
});

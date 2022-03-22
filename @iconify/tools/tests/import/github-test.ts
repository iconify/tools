import { promises as fs } from 'fs';
import {
	downloadGitHubRepo,
	DownloadGitHubRepoResult,
} from '../../lib/download/github';
import { prepareDirectoryForExport } from '../../lib/export/helpers/prepare';

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

describe('Downloading Git repository using GitHub API', () => {
	beforeAll(async () => {
		// Remove old cache
		await prepareDirectoryForExport({
			target,
			cleanup: true,
		});
	});

	let lastResult: DownloadGitHubRepoResult | 'not_modified';

	test('Downloading main branch', async () => {
		if (!token) {
			console.warn(
				`Cannot test downloadGitHubRepo() because API token is not provided. Set "${tokenKey}" environmental variable to test GitHub API.`
			);
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
			contentsDir: target + '/' + branch.subdir,
			hash: branch.hash,
		};
		expect(result).toEqual(expectedResult);
		lastResult = result;

		// Check contents of package.json
		const packageContents = JSON.parse(
			await fs.readFile(
				target + '/' + branch.subdir + '/package.json',
				'utf8'
			)
		);
		expect(packageContents.version).toBe(branch.version);
	});

	test('Downloading archive branch', async () => {
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
			contentsDir: target + '/' + branch.subdir,
			hash: branch.hash,
		};
		expect(result).toEqual(expectedResult);
		lastResult = result;

		// Check contents of package.json
		const packageContents = JSON.parse(
			await fs.readFile(
				target + '/' + branch.subdir + '/package.json',
				'utf8'
			)
		);
		expect(packageContents.version).toBe(branch.version);
	});

	test('Checking not_modified', async () => {
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

	test('Checking out main branch again', async () => {
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
			contentsDir: target + '/' + branch.subdir,
			hash: branch.hash,
		};
		expect(result).toEqual(expectedResult);
	});
});

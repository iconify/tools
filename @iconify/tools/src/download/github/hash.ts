import { sendAPIQuery } from '../api';
import type { GitHubAPIOptions } from './types';

/**
 * Get latest hash from GitHub using API
 */
export async function getGitHubRepoHash(
	options: GitHubAPIOptions
): Promise<string> {
	const uri = `https://api.github.com/repos/${options.user}/${options.repo}/branches/${options.branch}`;
	const response = await sendAPIQuery({
		uri,
		headers: {
			Accept: 'application/vnd.github.v3+json',
			Authorization: 'token ' + options.token,
		},
	});
	if (!response.success) {
		throw new Error(
			`Error downloading data from GitHub API: ${response.error}`
		);
	}

	interface GitHubAPIResponse {
		commit?: {
			sha: string;
		};
	}
	const content = JSON.parse(response.content) as GitHubAPIResponse;
	const hash = content?.commit?.sha;
	if (typeof hash !== 'string') {
		throw new Error('Error parsing GitHub API response');
	}
	return hash;
}

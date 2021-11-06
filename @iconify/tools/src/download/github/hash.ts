import { sendAPIQuery } from '../api';
import type { GitHubAPIOptions } from './types';

/**
 * Get latest hash from GitHub using API
 */
export async function getGitHubRepoHash(
	options: GitHubAPIOptions
): Promise<string> {
	const uri = `https://api.github.com/repos/${options.user}/${options.repo}/branches/${options.branch}`;
	const data = await sendAPIQuery({
		uri,
		headers: {
			Accept: 'application/vnd.github.v3+json',
			Authorization: 'token ' + options.token,
		},
	});
	if (typeof data !== 'string') {
		throw new Error(`Error downloading data from GitHub API: ${data}`);
	}
	const content = JSON.parse(data);
	const hash = content?.commit?.sha;
	if (typeof hash !== 'string') {
		throw new Error('Error parsing GitHub API response');
	}
	return hash;
}

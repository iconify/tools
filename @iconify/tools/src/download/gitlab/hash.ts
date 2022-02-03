import { sendAPIQuery } from '../api';
import { defaultGitLabBaseURI, GitLabAPIOptions } from './types';

/**
 * Get latest hash from GitHub using API
 */
export async function getGitLabRepoHash(
	options: GitLabAPIOptions
): Promise<string> {
	const uri = `${options.uri || defaultGitLabBaseURI}/${
		options.project
	}/repository/branches/${options.branch}/`;
	const data = await sendAPIQuery({
		uri,
		headers: {
			Authorization: 'token ' + options.token,
		},
	});
	if (typeof data !== 'string') {
		throw new Error(`Error downloading data from GitLab API: ${data}`);
	}
	const content = JSON.parse(data);
	const item = (content instanceof Array ? content : [content]).find(
		(item) =>
			item.name === options.branch && typeof item.commit.id === 'string'
	);
	if (!item) {
		throw new Error('Error parsing GitLab API response');
	}

	return item.commit.id;
}

/**
 * API options
 */
export interface GitLabAPIOptions {
	// Base URI
	uri?: string;

	// API token
	token: string;

	// Project id
	project: string;

	// Branch name
	branch: string;
}

/**
 * Default base URI for GitLab API
 */
export const defaultGitLabBaseURI = 'https://gitlab.com/api/v4/projects';

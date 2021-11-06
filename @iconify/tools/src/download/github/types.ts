/**
 * API options
 */
export interface GitHubAPIOptions {
	// API token
	token: string;

	// GitHub user or project name
	user: string;

	// Repository name
	repo: string;

	// Branch name
	branch: string;
}

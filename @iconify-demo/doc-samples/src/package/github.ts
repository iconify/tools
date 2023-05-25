import { downloadGitHubRepo } from '@iconify/tools';

// GITHUB_TOKEN=ghp_12345 node example.js
const token = process.env.GITHUB_TOKEN || '';

(async () => {
	console.log(
		await downloadGitHubRepo({
			target: 'downloads/jam',
			user: 'michaelampr',
			repo: 'jam',
			branch: 'master',
			token,
		})
	);
})();

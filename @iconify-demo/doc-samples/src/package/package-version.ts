import { downloadGitHubRepo, getPackageVersion } from '@iconify/tools';

// GITHUB_TOKEN=ghp_12345 node example.js
const token = process.env.GITHUB_TOKEN || '';

(async () => {
	// Download GitHub repository
	const result = await downloadGitHubRepo({
		target: 'downloads/bi',
		user: 'twbs',
		repo: 'icons',
		branch: 'main',
		token,
	});

	// Get version from downloaded package
	const version = await getPackageVersion(result.contentsDir);

	// '1.7.0'
	console.log('Version:', version);
})();

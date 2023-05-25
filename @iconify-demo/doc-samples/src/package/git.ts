import { downloadGitRepo } from '@iconify/tools';

(async () => {
	console.log(
		await downloadGitRepo({
			target: 'downloads/boxicons-{hash}',
			remote: 'git@github.com:atisawd/boxicons.git',
			branch: 'master',
			ifModifiedSince: true,
			log: true,
		})
	);
})();

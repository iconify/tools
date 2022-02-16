import { execAsync } from '../..';

/**
 * Reset Git repo contents
 */
export async function resetGitRepoContents(target: string) {
	await execAsync('git add -A', {
		cwd: target,
	});
	await execAsync('git reset --hard --quiet', {
		cwd: target,
	});
}

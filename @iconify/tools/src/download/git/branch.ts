import type { ExportTargetOptions } from '../../export/helpers/prepare';
import { execAsync } from '../../misc/exec';

/**
 * Get current branch from cloned git repo
 */
export async function getGitRepoBranch(
	options: ExportTargetOptions,
	checkout?: string
): Promise<string> {
	const result = await execAsync('git branch --show-current', {
		cwd: options.target,
	});
	const branch = result.stdout.trim();

	if (typeof checkout === 'string' && branch !== checkout) {
		// Checkout correct branch
		await execAsync(`git checkout ${checkout} "${options.target}"`);
		return await getGitRepoBranch(options);
	}

	return branch;
}

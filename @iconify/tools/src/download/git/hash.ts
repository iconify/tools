import type { ExportTargetOptions } from '../../export/helpers/prepare.js';
import { execAsync } from '../../misc/exec.js';

/**
 * Get latest hash from cloned git repo
 */
export async function getGitRepoHash(
	options: ExportTargetOptions
): Promise<string> {
	const result = await execAsync('git rev-parse HEAD', {
		cwd: options.target,
	});
	return result.stdout.trim();
}

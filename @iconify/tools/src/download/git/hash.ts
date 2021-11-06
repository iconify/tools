import type { ExportTargetOptions } from '../../export/helpers/prepare';
import { execAsync } from '../helpers/exec';

/**
 * Clone Git repo
 */
export async function getGitRepoHash(
	options: ExportTargetOptions
): Promise<string> {
	const result = await execAsync('git rev-parse HEAD', {
		cwd: options.target,
	});
	return result.stdout.trim();
}

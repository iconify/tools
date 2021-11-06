import { exec } from 'child_process';
import type { ExecOptions } from 'child_process';

export interface ExecResult {
	stdout: string;
	stderr: string;
}

/**
 * Exec as Promise
 */
export function execAsync(
	cmd: string,
	options?: ExecOptions
): Promise<ExecResult> {
	return new Promise((fulfill, reject) => {
		exec(
			cmd,
			{
				...options,
				encoding: 'utf8',
			},
			(error, stdout, stderr) => {
				if (error) {
					reject(error);
				} else {
					fulfill({
						stdout,
						stderr,
					});
				}
			}
		);
	});
}

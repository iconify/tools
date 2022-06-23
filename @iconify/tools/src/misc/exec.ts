import { resolve } from 'path';
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
		const fullOptions = {
			...options,
			encoding: 'utf8',
		};
		if (fullOptions.cwd) {
			// Relative directories sometimes do not work, so resolve directory first
			fullOptions.cwd = resolve(fullOptions.cwd);
		}
		exec(cmd, fullOptions, (error, stdout, stderr) => {
			if (error) {
				reject(error);
			} else {
				fulfill({
					stdout,
					stderr,
				});
			}
		});
	});
}

import { promises as fs } from 'fs';
import { normalize } from 'pathe';

/**
 * Recursive mkdir()
 */
export async function mkdir(dir: string): Promise<void> {
	dir = normalize(dir);
	if (dir.slice(-1) === '/') {
		dir = dir.slice(0, dir.length - 1);
	}
	const parts = dir.split('/');
	let currentDir: string | undefined;

	do {
		const next = parts.shift() as string;
		if (currentDir === void 0) {
			currentDir = next;
		} else {
			currentDir += '/' + next;
		}
		if (currentDir.length) {
			try {
				await fs.mkdir(currentDir, 0o755);
			} catch (err) {
				//
			}
		}
	} while (parts.length > 0);
}

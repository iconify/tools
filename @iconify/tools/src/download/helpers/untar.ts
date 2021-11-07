import { x } from 'tar';

/**
 * Unpack .tgz archive
 */
export async function untar(file: string, path: string): Promise<void> {
	await x({
		file,
		C: path,
	});
}

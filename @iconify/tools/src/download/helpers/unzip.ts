import { unzip as unzipAsync } from 'fflate';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, normalize } from 'pathe';

/**
 * Unzip archive
 */
export async function unzip(source: string, path: string): Promise<void> {
	const dir = normalize(path);
	const data = await readFile(source);

	// Write all files
	async function writeFiles(
		data: Record<string, Uint8Array<ArrayBufferLike>>
	): Promise<void> {
		const createdDirs = new Set<string>();
		for (const name in data) {
			// const content = data[name];
			const filePath = normalize(join(dir, name));
			if (
				filePath.startsWith('/') ||
				filePath.includes('..') ||
				filePath.includes(':')
			) {
				throw new Error('Invalid file path in zip: ' + filePath);
			}

			// Skip hidden MacOS files and directories
			if (filePath.includes('/._')) {
				continue;
			}

			// Try to create a directory
			const isDir = filePath.endsWith('/');
			const fileDir = isDir
				? filePath.slice(0, filePath.length - 1)
				: dirname(filePath);
			if (!createdDirs.has(fileDir)) {
				createdDirs.add(fileDir);
				try {
					await mkdir(fileDir, { recursive: true });
				} catch {
					//
				}
			}

			// Write file
			if (!isDir) {
				await writeFile(filePath, data[name]);
			}
		}
	}

	// Unpack archive
	return new Promise((resolve, reject) => {
		unzipAsync(data, (err, unzipped) => {
			if (err) {
				reject(err);
				return;
			}

			// Write all files
			writeFiles(unzipped)
				.then(() => resolve())
				.catch((err) => reject(err));
		});
	});
}

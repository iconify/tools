import { unpackTar } from 'modern-tar/fs';
import { createReadStream } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

/**
 * Unpack .tgz archive
 */
export async function untar(file: string, path: string): Promise<void> {
	const gzipStream = createReadStream(file, {
		highWaterMark: 256 * 1024, // 256 KB for optimal performance
	});
	await pipeline(gzipStream, createGunzip(), unpackTar(path));
}

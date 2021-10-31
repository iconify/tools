import { promises as fs } from 'fs';
import { normalize } from 'pathe';

/**
 * Common options for all functions that export to directory
 */
export interface ExportTargetOptions {
	// Target directory
	target: string;

	// Remove old files before exporting. Default is false
	cleanup?: boolean;
}

/**
 * Prepare directory for export
 *
 * Also normalizes directory and returns normalized value
 */
export async function prepareDirectoryForExport(
	options: ExportTargetOptions
): Promise<string> {
	// Normalise directory
	let dir = normalize(options.target);
	if (dir.slice(-1) === '/') {
		dir = dir.slice(0, dir.length - 1);
	}

	if (options.cleanup) {
		// Remove old files
		try {
			await fs.rm(dir, {
				recursive: true,
				force: true,
			});
		} catch (err) {
			//
		}
	}

	// Create directory if missing
	try {
		await fs.mkdir(dir, {
			recursive: true,
		});
	} catch (err) {
		//
	}

	return dir;
}

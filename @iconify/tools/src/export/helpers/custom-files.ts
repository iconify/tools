import { promises as fs } from 'fs';
import { writeJSONFile } from '../../misc/write-json';

/**
 * Options
 */
export interface ExportOptionsWithCustomFiles {
	// Custom files. Key of filename, value is content.
	// If value is null, file will be deleted. If value is an object, it will be handled as JSON data
	customFiles?: Record<string, string | Record<string, unknown> | null>;
}

/**
 * Write custom files
 */
export async function exportCustomFiles(
	dir: string,
	options: ExportOptionsWithCustomFiles,
	result?: Set<string>
): Promise<void> {
	const customFiles = options.customFiles || {};
	for (const filename in customFiles) {
		const content = customFiles[filename];
		if (content === null) {
			// Delete file, if exists
			try {
				await fs.unlink(dir + '/' + filename);
			} catch {
				//
			}
			continue;
		}
		if (typeof content === 'string') {
			await fs.writeFile(dir + '/' + filename, content, 'utf8');
		} else if (typeof content === 'object') {
			await writeJSONFile(dir + '/' + filename, content);
		}
		result?.add(filename);
	}
}

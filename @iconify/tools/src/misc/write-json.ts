import { writeFile } from 'node:fs/promises';

/**
 * Write JSON file
 */
export async function writeJSONFile(
	filename: string,
	data: unknown
): Promise<void> {
	return writeFile(filename, JSON.stringify(data, null, '\t') + '\n');
}

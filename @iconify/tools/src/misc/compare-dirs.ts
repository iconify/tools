import { promises as fs } from 'fs';
import { scanDirectory } from './scan';

/**
 * Extensions that are treated as text
 */
const textFileExtensions: string[] = [
	'json',
	'ts',
	'js',
	'mjs',
	'cjs',
	'jsx',
	'tsx',
	'vue',
	'svelte',
	'svg',
	'txt',
	'md',
];

export interface CompareDirectoriesOptions {
	// Ignore new line differences in text files. Default = true
	ignoreNewLine?: boolean;

	// Ignore version numbers in package.json. Default = true
	ignoreVersions?: boolean;

	// Custom extensions to treat as text
	textExtensions?: string[];
}

/**
 * Compare directories. Returns true if files are identical, false if different
 */
export async function compareDirectories(
	dir1: string,
	dir2: string,
	options?: CompareDirectoriesOptions
): Promise<boolean> {
	// Get all files
	const files1 = await scanDirectory(dir1);
	const files2 = await scanDirectory(dir2);
	if (files1.length !== files2.length) {
		return false;
	}

	// Options
	options = options || {};
	const ignoreNewLine = options.ignoreNewLine !== false;
	const ignoreVersions = options.ignoreVersions !== false;
	const textExtensions = new Set(
		(options.textExtensions || []).concat(textFileExtensions)
	);

	// Check all files
	for (let i = 0; i < files1.length; i++) {
		const file = files1[i];
		if (files2.indexOf(file) === -1) {
			return false;
		}

		const ext = (file.split('.').pop() as string).toLowerCase();
		const isText = textExtensions.has(ext);

		if (!isText) {
			// Compare binary files
			const content1 = await fs.readFile(dir1 + '/' + file);
			const content2 = await fs.readFile(dir2 + '/' + file);
			if (Buffer.compare(content1, content2) !== 0) {
				return false;
			}
			continue;
		}

		// Text files
		let content1 = await fs.readFile(dir1 + '/' + file, 'utf8');
		let content2 = await fs.readFile(dir2 + '/' + file, 'utf8');
		if (content1 === content2) {
			continue;
		}
		if (ignoreNewLine) {
			// Remove space before new line (\r\n -> \n), remove new line at the end
			content1 = content1.replace(/\s+\n/g, '\n').trimRight();
			content2 = content2.replace(/\s+\n/g, '\n').trimRight();
		}
		if (ignoreVersions && file.split('/').pop() === 'package.json') {
			// Ignore versions in package.json
			const data1 = JSON.parse(content1);
			const data2 = JSON.parse(content2);
			delete data1.version;
			delete data2.version;
			content1 = JSON.stringify(data1);
			content2 = JSON.stringify(data2);
		}
		if (content1 !== content2) {
			return false;
		}
	}

	return true;
}

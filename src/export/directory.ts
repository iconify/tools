import { promises as fs } from 'fs';
import { normalize } from 'pathe';
import type { IconifyIconCustomisations } from '@iconify/utils/lib/customisations';
import type { IconSet } from '../icon-set';

/**
 * Options
 */
export interface ExportToDirectoryOptions {
	// Target directory
	target: string;

	// Set icon height to 'auto', which results in width and height matching viewBox.
	// If false, height will be set to '1em'.
	// Default is true
	autoHeight?: boolean;

	// Include aliases. Default is true
	includeAliases?: boolean;

	// Include characters. Default is false
	includeChars?: boolean;

	// Log stored files. Default is false
	log?: boolean;
}

/**
 * Export icon set to directory
 *
 * Returns list of stored files
 */
export async function exportToDirectory(
	iconSet: IconSet,
	options: ExportToDirectoryOptions
): Promise<Set<string>> {
	const storedFiles: Set<string> = new Set();

	// Normalise and create directory if missing
	let dir = normalize(options.target);
	if (dir.slice(-1) === '/') {
		dir = dir.slice(0, dir.length - 1);
	}
	try {
		await fs.mkdir(dir, {
			recursive: true,
		});
	} catch (err) {
		//
	}

	const customisations: IconifyIconCustomisations =
		options.autoHeight === false
			? {
					height: '1em',
			  }
			: {
					width: 'auto',
					height: 'auto',
			  };

	// Function to save icon to file
	const store = async (name: string, target: string) => {
		const svg = iconSet.toString(name, customisations);
		if (!svg) {
			return;
		}

		await fs.writeFile(target, svg, 'utf8');

		storedFiles.add(target);
		if (options.log) {
			console.log(`Saved ${target} (${svg.length} bytes)`);
		}
	};

	// Export characters first, in case if icon name conflicts with character name
	if (options.includeChars) {
		const chars = iconSet.chars();
		for (const char in chars) {
			const name = chars[char];
			await store(name, `${dir}/${char}.svg`);
		}
	}

	// Export all icons
	await iconSet.forEach(async (name, type) => {
		if (type === 'alias' && options.includeAliases === false) {
			return;
		}
		await store(name, `${dir}/${name}.svg`);
	});

	return storedFiles;
}

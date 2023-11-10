import { readFile } from 'node:fs/promises';
import { downloadNPMPackage, IconSet, exportToDirectory } from '@iconify/tools';

// Directories
const cacheDir = 'cache';
const outDir = 'svg';

// Download all icon sets
console.log('Downloading latest package');
const downloaded = await downloadNPMPackage({
	package: '@iconify/json',
	target: cacheDir,
});
console.log('Downloaded version', downloaded.version);

// Get list of icon sets
const list = JSON.parse(
	await readFile(downloaded.contentsDir + '/collections.json', 'utf8')
);
const prefixes = Object.keys(list);
console.log('Got', prefixes.length, 'icon sets');

// Export each icon set
for (let i = 0; i < prefixes.length; i++) {
	const prefix = prefixes[i];

	// Read file
	const data = JSON.parse(
		await readFile(
			downloaded.contentsDir + '/json/' + prefix + '.json',
			'utf8'
		)
	);

	// Create IconSet
	const iconSet = new IconSet(data);

	// Export it
	console.log('Exporting', iconSet.info.name);
	await exportToDirectory(iconSet, {
		target: outDir + '/' + prefix,
	});
}

console.log('Done');

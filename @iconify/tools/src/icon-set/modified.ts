import type { IconSet } from '.';

/**
 * Check if icons in an icon set were updated.
 *
 * This function checks only icons, not metadata. It also ignores icon visibility.
 */
export function hasIconDataBeenModified(set1: IconSet, set2: IconSet): boolean {
	const entries1 = set1.entries;
	const entries2 = set2.entries;

	const keys1 = Object.keys(entries1);
	const keys2 = Object.keys(entries2);

	// Check number of icons first
	if (keys1.length !== keys2.length) {
		return true;
	}

	// Check if icon names are the same
	for (let i = 0; i < keys1.length; i++) {
		if (!entries2[keys1[i]]) {
			return true;
		}
	}

	// Check all icons
	for (let i = 0; i < keys1.length; i++) {
		const name = keys1[i];
		if (set1.toString(name) !== set2.toString(name)) {
			return true;
		}
	}

	// Icon sets are identical
	return false;
}

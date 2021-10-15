import { iconDefaults } from '@iconify/utils/lib/icon';
import type { FullIconifyIcon } from '@iconify/utils/lib/icon';
import type { IconSet } from '.';

// Maximum depth for looking for parent icons
const maxIteration = 5;

/**
 * Find matching icon in icon set
 */
export function findMatchingIcon(
	iconSet: IconSet,
	icon: FullIconifyIcon
): string | null {
	const body = icon.body;
	let hiddenMatch: string | null = null;

	function isMatching(data: FullIconifyIcon): boolean {
		for (const key in iconDefaults) {
			const attr = key as keyof typeof iconDefaults;
			if (data[attr] !== icon[attr]) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Check if icon matches
	 */
	function test(name: string, iteration: number): string | null {
		const data = iconSet.resolve(name, true);
		if (!data) {
			return null;
		}
		if (isMatching(data)) {
			if (data.hidden) {
				hiddenMatch = name;
			} else {
				return name;
			}
		}
		if (iteration > maxIteration) {
			return null;
		}

		// Check aliases
		for (const key in iconSet.entries) {
			const item = iconSet.entries[key];
			if (item.type === 'variation' && item.parent === name) {
				const result = test(key, iteration + 1);
				if (typeof result === 'string') {
					return result;
				}
			}
		}
		return null;
	}

	// Find icons that match
	for (const key in iconSet.entries) {
		const item = iconSet.entries[key];
		if (item.type === 'icon' && item.body === body) {
			// Possible match
			const result = test(key, 0);
			if (typeof result === 'string') {
				return result;
			}
		}
	}

	return hiddenMatch;
}

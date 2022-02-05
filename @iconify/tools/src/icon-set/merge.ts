import { IconSet } from '.';
import { findMatchingIcon } from './match';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertNever(v: never) {
	//
}

/**
 * Merge icon sets
 */
export function mergeIconSets(oldIcons: IconSet, newIcons: IconSet): IconSet {
	const mergedIcons = new IconSet(newIcons.export());
	const oldEntries = oldIcons.entries;
	const entries = mergedIcons.entries;

	function add(name: string): boolean {
		if (entries[name]) {
			// Already exists
			return true;
		}

		const item = oldEntries[name];
		switch (item.type) {
			case 'icon': {
				// Attempt to find matching icon
				const fullIcon = oldIcons.resolve(name, true);
				const parent = fullIcon
					? findMatchingIcon(mergedIcons, fullIcon)
					: null;
				if (parent !== null) {
					// Add as alias
					mergedIcons.setAlias(name, parent);
					return true;
				}

				// Add as is, duplicating props
				const props = item.props;
				mergedIcons.setItem(name, {
					...item,
					props: {
						...props,
						hidden: true,
					},
					categories: new Set(),
				});
				return true;
			}

			case 'variation':
			case 'alias': {
				// Add parent
				let parent = item.parent;
				if (!add(parent)) {
					return false;
				}
				const parentItem = entries[parent];
				if (parentItem.type === 'alias') {
					// Alias of alias - use parent
					parent = parentItem.parent;
				}

				if (item.type === 'variation') {
					// Hide variation and copy props
					const props = item.props;
					mergedIcons.setItem(name, {
						...item,
						parent,
						props: {
							...props,
							hidden: true,
						},
					});
				} else {
					mergedIcons.setItem(name, {
						...item,
						parent,
					});
				}
				return true;
			}

			default:
				assertNever(item);
				return false;
		}
	}

	// Add old icons
	for (const name in oldEntries) {
		add(name);
	}

	return mergedIcons;
}

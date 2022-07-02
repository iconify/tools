import type {
	IconifyJSON,
	ExtendedIconifyIcon,
	ExtendedIconifyAlias,
	IconifyInfo,
	IconifyIcons,
	IconifyAliases,
	IconifyCategories,
} from '@iconify/types';
import {
	defaultIconDimensions,
	defaultIconProps,
} from '@iconify/utils/lib/icon/defaults';
import { iconToSVG } from '@iconify/utils/lib/svg/build';
import type { IconifyIconCustomisations } from '@iconify/utils/lib/customisations/defaults';
import { minifyIconSet } from '@iconify/utils/lib/icon-set/minify';
import { convertIconSetInfo } from '@iconify/utils/lib/icon-set/convert-info';
import { filterProps, defaultCommonProps } from './props';
import type {
	CheckThemeResult,
	CommonIconProps,
	IconCategory,
	IconSetAsyncForEachCallback,
	IconSetIcon,
	IconSetIconAlias,
	IconSetIconEntry,
	IconSetIconType,
	IconSetIconVariation,
	ResolvedIconifyIcon,
} from './types';
import { SVG } from '../svg';
import type {
	ParentIconsList,
	ParentIconsTree,
} from '@iconify/utils/lib/icon-set/tree';
import { mergeIconData } from '@iconify/utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertNever(v: never) {
	//
}

// Theme keys
const themeKeys: ('prefixes' | 'suffixes')[] = ['prefixes', 'suffixes'];

/**
 * Sort theme keys: long keys first
 *
 * Applies changes to parameter, but also returns it
 */
export function sortThemeKeys(keys: string[]): string[] {
	return keys.sort((a, b) =>
		a.length === b.length ? a.localeCompare(b) : b.length - a.length
	);
}

/**
 * Export icon set
 */
export class IconSet {
	/**
	 * Properties. You can write directly to almost any property, but avoid writing to
	 * 'entries' and 'categories' properties, there are functions for that.
	 */
	// Icon set prefix
	public prefix!: string;

	// Last modification time
	public lastModified!: number;

	// All icons
	public entries!: Record<string, IconSetIconEntry>;

	// Information block
	public info: IconifyInfo | undefined;

	// Categories, using custom type. Use functions to update data
	public categories!: Set<IconCategory>;
	public prefixes!: Record<string, string>;
	public suffixes!: Record<string, string>;

	/**
	 * Load icon set
	 */
	constructor(data: IconifyJSON) {
		this.load(data);
	}

	/**
	 * Load icon set
	 */
	load(data: IconifyJSON): void {
		this.prefix = data.prefix;

		// Defaults
		const defaultProps = filterProps(data, defaultIconDimensions, true);

		// Add icons
		this.entries = Object.create(null) as typeof this.entries;
		const entries = this.entries;
		for (const name in data.icons) {
			const item = data.icons[name];
			const entry: IconSetIcon = {
				type: 'icon',
				body: item.body,
				props: filterProps(
					{
						...defaultProps,
						...item,
					},
					defaultCommonProps,
					true
				),
				chars: new Set(),
				categories: new Set(),
			};
			entries[name] = entry;
		}

		// Add aliases
		if (data.aliases) {
			for (const name in data.aliases) {
				if (entries[name]) {
					// identical alias and icon
					continue;
				}
				const item = data.aliases[name];
				const parent = item.parent;
				const props = filterProps(item, defaultCommonProps, false);
				const chars: Set<string> = new Set();
				if (Object.keys(props).length) {
					// Variation
					const entry: IconSetIconVariation = {
						type: 'variation',
						parent,
						props,
						chars,
					};
					entries[name] = entry;
				} else {
					// Alias
					const entry: IconSetIconAlias = {
						type: 'alias',
						parent,
						chars,
					};
					entries[name] = entry;
				}
			}
		}

		// Info
		const info = data.info && convertIconSetInfo(data.info);
		this.info = info || void 0;

		// Characters map
		if (data.chars) {
			for (const char in data.chars) {
				const name = data.chars[char];
				const icon = entries[name];
				if (icon) {
					icon.chars.add(char);
				}
			}
		}

		// Categories
		this.categories = new Set();
		if (data.categories) {
			for (const category in data.categories) {
				const item: IconCategory = {
					title: category,
					count: 0,
				};

				data.categories[category].forEach((iconName) => {
					const icon = entries[iconName];
					switch (icon?.type) {
						case 'icon':
							icon.categories.add(item);
					}
				});

				this.categories.add(item);
				this.listCategory(item);
			}
		}

		// Themes
		const prefixes = (this.prefixes = Object.create(null) as Record<
			string,
			string
		>);
		const suffixes = (this.suffixes = Object.create(null) as Record<
			string,
			string
		>);
		if (data.themes) {
			// Import legacy format
			for (const key in data.themes) {
				const item = data.themes[key];
				if (typeof item.prefix === 'string') {
					// Prefix ending with with '-'
					const prefix = item.prefix;
					if (prefix.slice(-1) === '-') {
						prefixes[prefix.slice(0, -1)] = item.title;
					}
				}
				if (typeof item.suffix === 'string') {
					// Suffix starting with with '-'
					const suffix = item.suffix;
					if (suffix.slice(0, 1) === '-') {
						suffixes[suffix.slice(1)] = item.title;
					}
				}
			}
		}
		themeKeys.forEach((prop) => {
			// Copy data, overwriting imported legacy format
			const items = data[prop];
			if (items) {
				this[prop] = Object.create(null) as Record<string, string>;
				for (const key in items) {
					this[prop][key] = items[key];
				}
			}
		});

		// Last modification time
		this.lastModified = data.lastModified || 0;
	}

	/**
	 * Update last modification time
	 */
	updateLastModified(value?: number) {
		this.lastModified = value || Math.floor(Date.now() / 1000);
	}

	/**
	 * List icons
	 */
	list(types: IconSetIconType[] = ['icon', 'variation']): string[] {
		return Object.keys(this.entries).filter((name) => {
			const type = this.entries[name].type;
			return types.indexOf(type) !== -1;
		});
	}

	/**
	 * forEach function to loop through all entries.
	 * Supports asynchronous callbacks.
	 *
	 * Callback should return false to stop loop.
	 */
	async forEach(
		callback: IconSetAsyncForEachCallback,
		types: IconSetIconType[] = ['icon', 'variation', 'alias']
	): Promise<void> {
		const names = this.list(types);
		for (let i = 0; i < names.length; i++) {
			const name = names[i];
			const item = this.entries[name];
			if (item) {
				let result = callback(name, item.type);
				if (result instanceof Promise) {
					result = await result;
				}
				if (result === false) {
					return;
				}
			}
		}
	}

	/**
	 * Get parent icons tree
	 *
	 * Returns parent icons list for each icon, null if failed to resolve.
	 * In parent icons list, first element is a direct parent, last is icon. Does not include item.
	 *
	 * Examples:
	 *   'alias3': ['alias2', 'alias1', 'icon']
	 * 	 'icon': []
	 * 	 'bad-icon': null
	 */
	getTree(names?: string[]): ParentIconsTree {
		const entries = this.entries;
		const resolved = Object.create(null) as ParentIconsTree;

		function resolve(name: string): ParentIconsList | null {
			const item = entries[name];
			if (!item) {
				// No such item
				return (resolved[name] = null);
			}

			if (item.type === 'icon') {
				// Icon
				return (resolved[name] = []);
			}

			if (resolved[name] === void 0) {
				// Mark as failed if parent alias points to this icon to avoid infinite loop
				resolved[name] = null;

				// Get parent icon name
				const parent = item.parent;

				// Get value for parent
				const value = parent && resolve(parent);
				if (value) {
					resolved[name] = [parent].concat(value);
				}
			}

			return resolved[name];
		}

		// Resolve only required icons
		(names || Object.keys(entries)).forEach(resolve);

		return resolved;
	}

	/**
	 * Resolve icon
	 */
	resolve(name: string, full: false): ResolvedIconifyIcon | null;
	resolve(name: string): ResolvedIconifyIcon | null;
	resolve(name: string, full: true): Required<ResolvedIconifyIcon> | null;
	resolve(
		name: string,
		full = false
	): Required<ResolvedIconifyIcon> | ResolvedIconifyIcon | null {
		// Get parent icons tree
		const entries = this.entries;
		const item = entries[name];
		const tree =
			item && (item.type === 'icon' ? [] : this.getTree([name])[name]);
		if (!tree) {
			return null;
		}

		// Parse tree, including icon
		let result = {} as ResolvedIconifyIcon;

		function parse(name: string) {
			const item = entries[name];
			if (item.type === 'alias') {
				return;
			}

			result = mergeIconData(item.props, result) as ResolvedIconifyIcon;
			if (item.type === 'icon') {
				result.body = item.body;
			}
		}

		parse(name);
		tree.forEach(parse);

		// Return icon
		return result && full ? { ...defaultIconProps, ...result } : result;
	}

	/**
	 * Generate HTML
	 */
	toString(
		name: string,
		customisations: IconifyIconCustomisations = {
			width: 'auto',
			height: 'auto',
		}
	): string | null {
		const item = this.resolve(name);
		if (!item) {
			return null;
		}
		const result = iconToSVG(item, customisations);

		const attributes = Object.keys(result.attributes)
			.map(
				(key) =>
					` ${key}="${
						result.attributes[key as keyof typeof result.attributes]
					}"`
			)
			.join('');
		return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"${attributes}>${result.body}</svg>`;
	}

	/**
	 * Get SVG instance for icon
	 */
	toSVG(name: string): SVG | null {
		const html = this.toString(name);
		return html ? new SVG(html) : null;
	}

	/**
	 * Export icon set
	 */
	export(validate = true): IconifyJSON {
		const icons = Object.create(null) as IconifyIcons;
		const aliases = Object.create(null) as IconifyAliases;
		const tree = validate
			? this.getTree()
			: (Object.create(null) as ParentIconsTree);

		// Add icons
		const names = Object.keys(this.entries);
		names.sort((a, b) => a.localeCompare(b));
		names.forEach((name) => {
			const item = this.entries[name];
			switch (item.type) {
				case 'icon': {
					const icon: ExtendedIconifyIcon = {
						body: item.body,
						...item.props,
					};
					icons[name] = icon;
					break;
				}

				case 'alias':
				case 'variation': {
					if (validate && !tree[name]) {
						break;
					}
					const props = item.type === 'variation' ? item.props : {};
					const alias: ExtendedIconifyAlias = {
						parent: item.parent,
						...props,
					};
					aliases[name] = alias;
					break;
				}

				default: {
					assertNever(item);
				}
			}
		});

		// Add info
		let info: IconifyInfo | undefined;
		if (this.info) {
			// Update icons count and clone object
			this.info.total = this.count();
			info = JSON.parse(JSON.stringify(this.info)) as IconifyInfo;
		}

		// Generate result
		const result = {
			prefix: this.prefix,
		} as IconifyJSON;
		if (info) {
			result.info = info;
		}
		if (this.lastModified) {
			result.lastModified = this.lastModified;
		}
		result.icons = icons;
		if (Object.keys(aliases).length) {
			result.aliases = aliases;
		}

		// Add characters
		const chars = this.chars(
			Object.keys(icons).concat(Object.keys(aliases))
		);
		if (Object.keys(chars).length) {
			result.chars = chars;
		}

		// Get categories
		const categories = Object.create(null) as IconifyCategories;
		Array.from(this.categories)
			// Sort
			.sort((a, b) => a.title.localeCompare(b.title))
			// Get list of icons
			.forEach((item) => {
				const names = this.listCategory(item);
				if (names) {
					names.sort((a, b) => a.localeCompare(b));
					categories[item.title] = names;
				}
			});

		if (Object.keys(categories).length) {
			result.categories = categories;
		}

		// Add themes
		themeKeys.forEach((prop) => {
			const items = this[prop];
			const keys = Object.keys(items);
			if (keys.length) {
				// Get matching icon names
				const sortedTheme = Object.create(null) as Record<
					string,
					string
				>;
				const tested = this.checkTheme(prop === 'prefixes');

				// Add all themes that aren't empty
				keys.forEach((key) => {
					if (tested.valid[key].length) {
						sortedTheme[key] = items[key];
					}
				});

				// Make sure themes do exist
				if (Object.keys(sortedTheme).length) {
					result[prop] = sortedTheme;
				}
			}
		});

		// Minify icon set
		minifyIconSet(result);

		return result;
	}

	/**
	 * Get characters map
	 */
	chars(names?: string[]): Record<string, string> {
		const chars = Object.create(null) as Record<string, string>;
		if (!names) {
			names = Object.keys(this.entries);
		}
		for (let i = 0; i < names.length; i++) {
			const name = names[i];
			const item = this.entries[name];
			item.chars.forEach((char) => {
				chars[char] = name;
			});
		}
		return chars;
	}

	/**
	 * Filter icons
	 */
	_filter(
		callback: (
			name: string,
			item: IconSetIconEntry,
			icon?: ResolvedIconifyIcon
		) => boolean
	): string[] {
		const names: string[] = [];
		for (const key in this.entries) {
			const item = this.entries[key];
			switch (item.type) {
				case 'icon': {
					if (callback(key, item)) {
						names.push(key);
					}
					break;
				}

				case 'variation':
				case 'alias': {
					// Resolve alias to make sure parent icon is not hidden
					const icon = this.resolve(key);
					if (icon && callback(key, item, icon)) {
						names.push(key);
					}
					break;
				}
			}
		}
		return names;
	}

	/**
	 * Count icons
	 */
	count(): number {
		return this._filter((_key, item, icon) => {
			if (item.type === 'alias' || item.props.hidden || icon?.hidden) {
				return false;
			}
			return true;
		}).length;
	}

	/**
	 * Find category by title
	 */
	findCategory(title: string, add: boolean): IconCategory | null {
		const categoryItem = Array.from(this.categories).find(
			(item) => item.title === title
		);
		if (categoryItem) {
			return categoryItem;
		}

		if (add) {
			const newItem: IconCategory = {
				title,
				count: 0,
			};
			this.categories.add(newItem);
			return newItem;
		}

		return null;
	}

	/**
	 * Count icons in category, remove category if empty
	 *
	 * Hidden icons and aliases do not count
	 */
	listCategory(category: IconCategory | string): string[] | null {
		// Find item
		const categoryItem =
			typeof category === 'string'
				? this.findCategory(category, false)
				: category;
		if (!categoryItem) {
			return null;
		}

		// Find icons
		const icons = this._filter((_key, item) => {
			if (item.type !== 'icon' || item.props.hidden) {
				return false;
			}
			return item.categories.has(categoryItem);
		});

		// Update count, remove category if empty
		const count = icons.length;
		categoryItem.count = count;
		if (!count) {
			this.categories.delete(categoryItem);
			return null;
		}

		return icons;
	}

	/**
	 * Check if icon exists
	 */
	exists(name: string): boolean {
		return !!this.entries[name];
	}

	/**
	 * Remove icons. Returns number of removed icons
	 *
	 * If removeDependencies is a string, it represents new parent for all aliases of removed icon. New parent cannot be alias or variation.
	 */
	remove(name: string, removeDependencies: boolean | string = true): number {
		const entries = this.entries;

		// Check if new parent exists
		if (typeof removeDependencies === 'string') {
			const item = entries[removeDependencies];
			if (name === removeDependencies || item?.type !== 'icon') {
				return 0;
			}
		}

		const item = entries[name];
		if (!item) {
			return 0;
		}

		// Icon set is about to be modified
		this.updateLastModified();

		// Update dependencies
		if (typeof removeDependencies === 'string') {
			for (const key in entries) {
				const item = entries[key];
				if (item.type !== 'icon' && item.parent === name) {
					item.parent = removeDependencies;
				}
			}
			return 0;
		}

		// Remove item
		delete entries[name];
		let count = 1;

		// Remove icons where parent matches removed icon
		function remove(parent: string) {
			const list: string[] = Object.keys(entries).filter((name) => {
				const item = entries[name];
				return item.type !== 'icon' && item.parent === parent;
			});
			list.forEach((name) => {
				if (entries[name]) {
					delete entries[name];
					count++;
					remove(name);
				}
			});
		}

		if (removeDependencies === true) {
			remove(name);
		}

		return count;
	}

	/**
	 * Remove icon
	 */
	rename(oldName: string, newName: string): boolean {
		const entries = this.entries;

		// Remove existing item with new name
		if (entries[newName]) {
			if (!this.remove(newName)) {
				return false;
			}
		}

		// Rename icon
		if (!entries[oldName]) {
			return false;
		}
		entries[newName] = entries[oldName];
		delete entries[oldName];

		// Find aliases
		for (const key in entries) {
			const item = entries[key];
			switch (item.type) {
				case 'icon':
					break;

				case 'alias':
				case 'variation':
					if (item.parent === oldName) {
						item.parent = newName;
					}
					break;

				default:
					assertNever(item);
			}
		}

		// Update last modification time
		this.updateLastModified();

		return true;
	}

	/**
	 * Add/update item
	 */
	setItem(name: string, item: IconSetIconEntry): boolean {
		switch (item.type) {
			case 'alias':
			case 'variation': {
				if (!this.entries[item.parent]) {
					return false;
				}
			}
		}
		this.entries[name] = item;
		this.updateLastModified();
		return true;
	}

	/**
	 * Add/update icon
	 */
	setIcon(name: string, icon: ResolvedIconifyIcon): boolean {
		return this.setItem(name, {
			type: 'icon',
			body: icon.body,
			props: filterProps(icon, defaultCommonProps, true),
			chars: new Set(),
			categories: new Set(),
		});
	}

	/**
	 * Add/update alias without props
	 */
	setAlias(name: string, parent: string): boolean {
		return this.setItem(name, {
			type: 'alias',
			parent,
			chars: new Set(),
		});
	}

	/**
	 * Add/update alias with props
	 */
	setVariation(
		name: string,
		parent: string,
		props: CommonIconProps
	): boolean {
		return this.setItem(name, {
			type: 'variation',
			parent,
			props,
			chars: new Set(),
		});
	}

	/**
	 * Icon from SVG. Updates old icon if it exists
	 */
	fromSVG(name: string, svg: SVG): boolean {
		const props: CommonIconProps = { ...svg.viewBox };
		const body = svg.getBody();
		const item = this.entries[name];

		switch (item?.type) {
			case 'icon':
			case 'variation': {
				// Set icon
				return this.setItem(name, {
					type: 'icon',
					body,
					props,
					chars: item.chars,
					categories:
						item.type === 'icon' ? item.categories : new Set(),
				});
			}
		}

		// Create new entry
		return this.setIcon(name, {
			body,
			...props,
		});
	}

	/**
	 * Add or remove character for icon
	 */
	toggleCharacter(iconName: string, char: string, add: boolean): boolean {
		const item = this.entries[iconName];
		if (!item) {
			return false;
		}
		if (item.chars.has(char) !== add) {
			item.chars[add ? 'add' : 'delete'](char);
			return true;
		}
		return false;
	}

	/**
	 * Add or remove category for icon
	 */
	toggleCategory(iconName: string, category: string, add: boolean): boolean {
		const item = this.entries[iconName];
		const categoryItem = this.findCategory(category, add);
		if (!item || !categoryItem) {
			return false;
		}
		switch (item.type) {
			case 'icon':
				if (item.categories.has(categoryItem) !== add) {
					categoryItem.count += add ? 1 : -1;
					item.categories[add ? 'add' : 'delete'](categoryItem);
					return true;
				}
		}
		return false;
	}

	/**
	 * Find icons that belong to theme
	 */
	checkTheme(prefix: boolean): CheckThemeResult {
		const themes = prefix ? this.prefixes : this.suffixes;
		const keys = sortThemeKeys(Object.keys(themes));

		const results: CheckThemeResult = {
			valid: Object.create(null) as CheckThemeResult['valid'],
			invalid: [],
		};
		keys.forEach((key) => {
			results.valid[key] = [];
		});

		results.invalid = this._filter((name, item, icon) => {
			if (item.type === 'alias' || item.props.hidden || icon?.hidden) {
				return false;
			}

			// Check if icon belongs to theme
			for (let i = 0; i < keys.length; i++) {
				const search = keys[i];
				if (search === '') {
					// Last item: matches all icons that do not belong to other themes
					results.valid[search].push(name);
					return false;
				}
				const match = prefix ? search + '-' : '-' + search;
				const length = match.length;
				const test = prefix
					? name.slice(0, length)
					: name.slice(0 - length);
				if (test === match) {
					// Icon belongs to theme
					results.valid[search].push(name);
					return false;
				}
			}

			// Icon does not belong to any theme
			return true;
		});

		return results;
	}
}

/**
 * Create blank icon set
 */
export function blankIconSet(prefix: string): IconSet {
	return new IconSet({
		prefix,
		icons: {},
	});
}

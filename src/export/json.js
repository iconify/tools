/**
 * This file is part of the @iconify/tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const helpers = require('../helpers');
const optimize = require('@iconify/json-tools').Collection.optimize;

const defaults = {
	// True if characters table added by importing fonts should be included in JSON output
	includeChars: true,

	// True if aliases should be included in JSON output
	includeAliases: true,

	// True if categories should be included in JSON output
	includeCategories: false,

	// True if inlineHeight, inlineTop and verticalAlign attributes should be included in output
	includeInline: true,

	// True if prefix should be included separately
	// If enabled and collection has no prefix, exporter will try to detect common prefix (result is saved in collection)
	separatePrefix: true,

	// If true, common values would be moved to root scope to make JSON file smaller
	optimize: false,

	// If true all white space is removed, making file smaller, but harder to read
	minify: false,

	// Information block, overrides collection's block
	info: null,

	// Themes block (legacy), overrides collection's block
	themes: null,

	// Prefixes and suffixes, replacement for themes block for new format
	themePrefixes: null,
	themeSuffixes: null,
};

const transformKeys = ['rotate', 'vFlip', 'hFlip'];

const positionAttributes = ['left', 'top'];

const inlineAttributes = ['inlineHeight', 'inlineTop', 'verticalAlign'];

const extraAttributes = ['deprecated', 'hidden', 'renamed'];

/**
 * Export collection to json file
 *
 * @param {Collection} collection Collection to export
 * @param {string} [target] Target filename
 * @param {object} [options] Options
 * @returns {Promise}
 */
module.exports = (collection, target, options) => {
	options = options === void 0 ? Object.create(null) : options;
	Object.keys(defaults).forEach((key) => {
		if (options[key] === void 0) {
			options[key] = defaults[key];
		}
	});

	// Function to add prefix to name if needed
	let prefix = (key) =>
		options.separatePrefix
			? key
			: (collection.prefix === '' ? '' : collection.prefix + ':') + key;

	// Return promise
	return new Promise((fulfill, reject) => {
		let json = Object.create(null),
			categories = Object.create(null);

		if (options.separatePrefix) {
			if (
				collection.prefix === '' &&
				collection.findCommonPrefix(true) === ''
			) {
				options.separatePrefix = false;
			} else {
				json.prefix = collection.prefix;
			}
		}

		// Add info block
		if (
			collection.info &&
			collection.info.name &&
			typeof collection.info.author === 'object'
		) {
			json.info = JSON.parse(JSON.stringify(collection.info));
			json.info.total = collection.length(true, true);
		}
		if (
			options.info &&
			options.info.name &&
			typeof options.info.author === 'object'
		) {
			json.info = JSON.parse(JSON.stringify(options.info));
			json.info.total = collection.length(true, true);
		}

		// Create icons block
		json.icons = Object.create(null);

		// Export all files
		let keys = collection.keys();
		keys.sort((a, b) => a.localeCompare(b));
		keys.forEach((key) => {
			let svg = collection.items[key],
				iconKey = prefix(key);

			json.icons[iconKey] = {
				body: svg.getBody().replace(/\s*\n\s*/g, ''),
				width: svg.width,
				height: svg.height,
			};

			// Add left/top
			positionAttributes.forEach((attr) => {
				if (svg[attr] !== 0) {
					json.icons[iconKey][attr] = svg[attr];
				}
			});

			// Add transformations
			transformKeys.forEach((attr) => {
				if (svg[attr] !== void 0) {
					json.icons[iconKey][attr] = svg[attr];
				}
			});

			// Include inline attributes
			if (options.includeInline) {
				inlineAttributes.forEach((attr) => {
					if (svg[attr] !== void 0) {
						json.icons[iconKey][attr] = svg[attr];
					}
				});
			}

			// Extra attributes
			extraAttributes.forEach((attr) => {
				if (svg[attr] !== void 0) {
					json.icons[iconKey][attr] = svg[attr];
				}
			});

			// Category
			if (options.includeCategories && svg.category !== void 0) {
				let list =
					typeof svg.category === 'string' ? [svg.category] : svg.category;
				list.forEach((cat) => {
					if (categories[cat] === void 0) {
						categories[cat] = [];
					}
					categories[cat].push(iconKey);
				});
			}
		});

		// Add aliases
		if (options.includeAliases) {
			let aliases = Object.create(null);

			collection.forEach((svg, key) => {
				if (svg.aliases) {
					let parentKey = prefix(key);

					svg.aliases.forEach((alias) => {
						// Check alias format
						let item = {
								parent: parentKey,
							},
							name;

						switch (typeof alias) {
							case 'string':
								name = alias;
								break;

							case 'object':
								if (alias.name === void 0) {
									return;
								}
								name = alias.name;

								transformKeys.forEach((key) => {
									if (alias[key] !== void 0) {
										item[key] = alias[key];
									}
								});

								extraAttributes.forEach((key) => {
									if (alias[key] !== void 0) {
										item[key] = alias[key];
									}
								});

								break;

							default:
								return;
						}

						// Add prefix
						name = prefix(name);

						// Check for duplicate
						if (json.icons[name] !== void 0) {
							return;
						}

						// Add alias
						aliases[name] = item;
					});
				}
			});

			// Sort keys
			let keys = Object.keys(aliases);
			if (keys.length) {
				keys.sort((a, b) => a.localeCompare(b));
				json.aliases = Object.create(null);
				keys.forEach((key) => {
					json.aliases[key] = aliases[key];
				});
			}
		}

		// Add characters
		if (options.includeChars) {
			let chars = Object.create(null);
			collection.forEach((svg, key) => {
				if (svg.char === void 0) {
					return;
				}
				if (options.includeAliases && svg.aliases) {
					svg.aliases.forEach((alias) => {
						if (
							typeof alias === 'object' &&
							alias.char !== void 0 &&
							alias.name !== void 0
						) {
							chars[alias.char] = prefix(alias.name);
						}
					});
				}
				chars[svg.char] = prefix(key);
			});

			// Sort keys
			let keys = Object.keys(chars);
			if (keys.length) {
				keys.sort((a, b) => a.localeCompare(b));
				json.chars = Object.create(null);
				keys.forEach((key) => {
					json.chars[key] = chars[key];
				});
			}
		}

		// Add categories
		if (options.includeCategories) {
			let categoryKeys = Object.keys(categories);

			if (categoryKeys.length) {
				categoryKeys.sort((a, b) => a.localeCompare(b));
				json.categories = Object.create(null);
				categoryKeys.forEach((key) => {
					categories[key].sort((a, b) => a.localeCompare(b));
					json.categories[key] = categories[key];
				});
			}
		}

		// Add themes
		if (collection.themes) {
			json.themes = JSON.parse(JSON.stringify(collection.themes));
		} else if (options.themes) {
			json.themes = JSON.parse(JSON.stringify(options.themes));
		}

		['prefixes', 'suffixes'].forEach((attr) => {
			if (collection[attr]) {
				json[attr] = Object.assign({}, collection[attr]);
				return;
			}

			const optionsKey =
				'theme' + attr.slice(0, 1).toUpperCase() + attr.slice(1);
			if (options[optionsKey]) {
				json[attr] = Object.assign({}, options[optionsKey]);
			}
		});

		// Optimize common attributes by moving duplicate items to root
		if (options.optimize) {
			optimize(json);
		}

		// Export
		let content = options.minify
			? JSON.stringify(json)
			: JSON.stringify(json, null, '\t');
		if (typeof target === 'string') {
			try {
				helpers.mkdir(path.dirname(target));
				fs.writeFileSync(target, content, 'utf8');
			} catch (err) {
				reject(err);
				return;
			}
		}
		fulfill(json);
	});
};

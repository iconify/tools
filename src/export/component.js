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
const helpers = require('../helpers');

const defaults = {
	// True if .d.ts files should be exported
	definitions: true,

	// Directory for uncompiled files. Set to non-string (false, null) to disable
	sources: '/src',

	// Directory for compiled files. Set to non-string (false, null) to disable
	compiled: '',

	// Export package.json, boolean or file name
	package: true,

	// Export README.md, boolean or file name
	readme: true,

	// Information for package.json and README.md:
	// Package name
	name: '@iconify/icons-{prefix}',

	// Version number
	version: null,

	// Array of icon samples
	samples: [],

	// Collection information
	info: null,
};

const transformKeys = ['rotate', 'vFlip', 'hFlip'];

const positionAttributes = ['left', 'top'];

const inlineAttributes = ['inlineHeight', 'inlineTop', 'verticalAlign'];

/**
 * Convert icon name to camelCase with optional "Icon" suffix
 *
 * @param {string} name
 * @return {string}
 */
const iconName = name => {
	let parts = name.split(/[-:]/),
		result = parts.shift();

	if (name.charCodeAt(0) < 97 || name.charCodeAt(0) > 122) {
		// Not a-z - add "icon" at start so variable doesn't start with invalid character
		parts.unshift('icon');
	} else if (parts.length < 1) {
		// Add "Icon" to avoid reserved keywords
		parts.push('icon');
	}

	parts.forEach(part => {
		result += part.slice(0, 1).toUpperCase() + part.slice(1);
	});

	return result;
};

/**
 * Export collection to js files
 *
 * @param {Collection} collection Collection to export
 * @param {string} [dir] Target directory
 * @param {object} [options] Options
 * @returns {Promise}
 */
module.exports = (collection, dir, options) =>
	new Promise((fulfill, reject) => {
		options = options === void 0 ? Object.create(null) : options;
		Object.keys(defaults).forEach(key => {
			if (options[key] === void 0) {
				options[key] = defaults[key];
			}
		});

		let name =
				options.info && options.info.name
					? options.info.name
					: collection.prefix,
			packageName = options.name.replace('{prefix}', collection.prefix);

		/**
		 * Export package.json
		 */
		const exportPackage = () => {
			let result = {
				name: packageName,
				description: 'Iconify icon components for React for ' + name,
			};

			if (typeof options.version === 'string') {
				result.version = options.version;
			}

			if (options.info) {
				let infoBlock = {};
				[
					'name',
					'version',
					'author',
					'url',
					'license',
					'licenseURL',
					'palette',
				].forEach(key => {
					if (options.info[key] !== void 0) {
						infoBlock[key] = options.info[key];
					}
				});
				if (Object.keys(infoBlock).length > 1) {
					result.iconsSet = infoBlock;
				}
			}

			result.bugs = 'https://github.com/iconify/iconify-react/issues';
			result.homepage = 'https://github.com/iconify/iconify-react';

			fs.writeFileSync(
				dir + '/package.json',
				JSON.stringify(result, null, '\t'),
				'utf8'
			);
		};

		/**
		 * Export README.md
		 */
		const exportReadme = () => {
			let result = '# ' + name + ' for Iconify for React\n\n';
			result +=
				'This package includes individual files for each icon, ready to be imported into React project with Iconify for React.\n\n';
			result +=
				'Each icon is in its own file, so you can bundle several icons from different icon sets without bundling entire icon sets.\n\n';

			result += '## Installation\n\n';
			result += 'If you are using NPM:\n';
			result +=
				'```\nnpm install @iconify/react ' + packageName + ' --save\n```\n\n';
			result += 'If you are using Yarn:\n';
			result += '```\nyarn add @iconify/react ' + packageName + '\n```\n\n';

			result += '## Usage\n\n';
			let sample0 = iconName(options.samples[0]);
			let sample1 = iconName(options.samples[1]);
			let sample2 = iconName(options.samples[2]);
			result += '```\nimport { Icon, InlineIcon } from "@iconify/react";\n';
			result +=
				'import ' +
				sample0 +
				' from "' +
				packageName +
				'/' +
				options.samples[0] +
				'";\n';
			result +=
				'import ' +
				sample1 +
				' from "' +
				packageName +
				'/' +
				options.samples[1] +
				'";\n';
			result += '```\n\n';
			result +=
				'```\n<Icon icon={' +
				sample0 +
				'} />\n<p>This is some text with icon adjusted for baseline: <InlineIcon icon={' +
				sample1 +
				'} /></p>\n```\n\n';
			result += 'See https://github.com/iconify/iconify-react for details.\n\n';

			if (
				options.info &&
				options.info.author !== void 0 &&
				options.info.name !== void 0
			) {
				let keys = {
					author: 'Icons author: ',
					url: 'Website: ',
					license: 'License: ',
					licenseURL: 'License URL: ',
				};
				result += '## About ' + options.info.name + '\n\n';
				Object.keys(keys).forEach(key => {
					if (options.info[key] !== void 0) {
						result += keys[key] + options.info[key] + '\n';
					}
				});
				result += '\n';
			}

			fs.writeFileSync(dir + '/README.md', result, 'utf8');
		};

		/**
		 * Export typescript file
		 *
		 * @param {string} filename
		 */
		const exportTS = filename => {
			fs.writeFileSync(
				filename + '.d.ts',
				'declare const data: object;\nexport default data;\n'
			);
		};

		/**
		 * Export icon
		 *
		 * @param {string} name
		 * @param {object} data
		 */
		const exportIcon = (name, data) => {
			let content = JSON.stringify(data, null, '\t'),
				code;

			// Save uncompiled file
			if (typeof options.sources === 'string') {
				code = 'let data = ' + content + ';\nexport default data;\n';
				fs.writeFileSync(
					dir + options.sources + '/' + name + '.js',
					code,
					'utf8'
				);
				if (options.definitions) {
					exportTS(dir + options.sources + '/' + name);
				}
			}

			// Save compiled file
			if (typeof options.compiled === 'string') {
				code =
					'var data = ' +
					content +
					';\nexports.__esModule = true;\nexports.default = data;\n';
				fs.writeFileSync(
					dir + options.compiled + '/' + name + '.js',
					code,
					'utf8'
				);
				if (options.definitions) {
					exportTS(dir + options.compiled + '/' + name);
				}
			}
		};

		// Prepare output directories
		if (typeof options.sources === 'string') {
			helpers.mkdir(dir + options.sources);
		}
		if (typeof options.compiled === 'string') {
			helpers.mkdir(dir + options.compiled);
		}

		// Get samples
		let samples = options.samples instanceof Array ? options.samples : [];
		if (samples.length < 3) {
			let icons = collection.keys(false);
			for (let i = 0; i < 3; i++) {
				samples[i] =
					samples[i] === void 0
						? icons[Math.floor((icons.length / 4) * (i + 1))]
						: samples[i];
			}
		}

		// Export all icons
		collection.forEach((svg, key, prefix) => {
			let json = {
				body: svg.getBody().replace(/\s*\n\s*/g, ''),
				width: svg.width,
				height: svg.height,
			};

			// Add left/top
			positionAttributes.forEach(attr => {
				if (svg[attr] !== 0) {
					json[attr] = svg[attr];
				}
			});

			// Add transformations
			transformKeys.forEach(attr => {
				if (svg[attr] !== void 0) {
					json[attr] = svg[attr];
				}
			});

			// Include inline attributes
			if (options.includeInline) {
				inlineAttributes.forEach(attr => {
					if (svg[attr] !== void 0) {
						json[attr] = svg[attr];
					}
				});
			}

			exportIcon(key, json);

			// Export aliases
			(svg.aliases ? svg.aliases : []).forEach(alias => {
				switch (typeof alias) {
					case 'string':
						if (collection.items[alias] === void 0) {
							exportIcon(alias, json);
						}
						return;

					case 'object':
						if (
							alias.name === void 0 ||
							collection.items[alias.name] !== void 0
						) {
							return;
						}

						let data = Object.assign({}, json);

						transformKeys.forEach(key => {
							if (alias[key] === void 0) {
								return;
							}
							if (data[key] === void 0) {
								data[key] = alias[key];
								return;
							}

							let value = data[key];
							switch (key) {
								case 'rotate':
									value = (value + alias[key]) % 4;
									break;

								default:
									value = value !== alias[key];
							}

							if (!value) {
								delete data[key];
							} else {
								data[key] = value;
							}
						});
						exportIcon(alias.name, data);
				}
			});
		});

		if (options.package) {
			exportPackage();
		}

		if (options.readme) {
			exportReadme();
		}

		fulfill(collection);
	});

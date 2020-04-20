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

const iconType = `interface IconifyIcon {
    body: string;
	left?: number;
	top?: number;
	width?: number;
	height?: number;
	rotate?: number;
	hFlip?: boolean;
	vFlip?: boolean;
}
declare const data: IconifyIcon;
export default data;
`;

const iconLegacyType = `interface LegacyIconifyIcon {
    body: string;
	left?: number;
	top?: number;
	width?: number;
	height?: number;
	rotate?: number;
	hFlip?: boolean;
    vFlip?: boolean;
    // Legacy stuff
    inlineTop?: number;
    inlineHeight?: number;
    verticalAlign?: number;
}
declare const data: LegacyIconifyIcon;
export default data;
`;

const legacyAttributes = ['inlineTop', 'inlineHeight', 'verticalAlign'];

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
const iconName = (name, addSuffix = true) => {
	let parts = name.split(/[-:]/),
		result = parts.shift();

	if (name.charCodeAt(0) < 97 || name.charCodeAt(0) > 122) {
		// Not a-z - add "icon" at start so variable doesn't start with invalid character
		parts.unshift('icon');
	} else if (parts.length < 1 && addSuffix) {
		// Add "Icon" to avoid reserved keywords
		parts.push('icon');
	}

	parts.forEach((part) => {
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
module.exports = (collection, dir, options) => {
	return new Promise((fulfill, reject) => {
		options = options === void 0 ? Object.create(null) : options;
		Object.keys(defaults).forEach((key) => {
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
				description: 'Iconify icon components for ' + name,
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
				].forEach((key) => {
					if (options.info[key] !== void 0) {
						infoBlock[key] = options.info[key];
					}
				});
				if (Object.keys(infoBlock).length > 1) {
					result.iconsSet = infoBlock;
				}
			}

			result.bugs = 'https://github.com/iconify/iconify/issues';
			result.homepage = 'https://github.com/iconify/iconify';

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
			const templatesDir = __dirname + '/templates';
			const replacements = {
				iconSetName: name,
				packageName: packageName,
				iconSetPrefix: collection.prefix,
			};

			/**
			 * Replace all key/value pairs in text
			 */
			function replaceContent(content, replacements) {
				(replacements instanceof Array ? replacements : [replacements]).forEach(
					(list) => {
						Object.keys(list).forEach((key) => {
							const value = list[key];

							let start = 0;
							let pos;

							while ((pos = content.indexOf(key, start)) !== -1) {
								content =
									content.slice(0, pos) +
									value +
									content.slice(pos + key.length);
								start = pos + value.length;
							}
						});
					}
				);
				return content;
			}

			// Find all language specific templates
			const languages = [];
			fs.readdirSync(templatesDir).forEach((file) => {
				let parts = file.split('.');
				if (parts.length !== 2 || parts.pop() !== 'md') {
					return;
				}
				parts = parts[0].split('-');
				if (parts.shift() !== 'sample') {
					return;
				}
				const lang = parts.shift();
				if (languages.indexOf(lang) === -1) {
					languages.push(lang);
				}
			});

			// Parse all languages
			languages.forEach((lang) => {
				const codeSamples = [];
				options.samples.forEach((sample, index) => {
					// Get sample name
					let sampleReplacements = {
						sampleFilename: sample,
						sampleIconShortName: iconName(sample, false),
						sampleIconName: iconName(sample),
					};

					// Get template
					let content;
					try {
						content = fs.readFileSync(
							`${templatesDir}/sample-${lang}-${index}.md`,
							'utf8'
						);
					} catch (err) {
						try {
							content = fs.readFileSync(
								`${templatesDir}/sample-${lang}.md`,
								'utf8'
							);
						} catch (err) {
							return;
						}
					}

					// Replace content
					content = replaceContent(content, [sampleReplacements, replacements]);
					codeSamples.push(content.trim());
				});
				replacements['`samples.' + lang + '`'] = codeSamples.join('\n\n');
			});

			// Get content
			let content = fs
				.readFileSync(templatesDir + '/component.md', 'utf8')
				.trim();

			// Author information
			if (
				options.info &&
				options.info.author !== void 0 &&
				options.info.name !== void 0
			) {
				const phrases = {
					author: 'Icons author: ',
					url: 'Website: ',
					license: 'License: ',
					licenseURL: 'License URL: ',
				};

				const list = [];

				// Author name and website
				if (typeof options.info.author === 'object') {
					const author = options.info.author;
					if (typeof author.name === 'string') {
						list.push(phrases.author + author.name);
						if (typeof author.url === 'string') {
							list.push(phrases.url + author.url);
						}
					}
				} else if (typeof options.info.author === 'string') {
					list.push(phrases.author + options.info.author);
				}

				// License
				if (typeof options.info.license === 'object') {
					const license = options.info.license;
					if (typeof license.title === 'string') {
						list.push(phrases.license + license.title);
						if (typeof license.url === 'string') {
							list.push(phrases.licenseURL + license.url);
						}
					}
				} else if (typeof options.info.license === 'string') {
					list.push(phrases.license + options.info.license);
				}

				if (list.length) {
					const infoReplacements = {
						iconSetInfo: list.join('\n\n'),
					};

					let info = fs.readFileSync(templatesDir + '/info.md', 'utf8');
					content += '\n\n' + replaceContent(info, infoReplacements).trim();
				}
			}

			// Replace content
			content = replaceContent(content, replacements) + '\n';

			// Check if there are missing samples
			if (content.indexOf('`samples.') !== -1) {
				throw new Error('Did not replace all samples in generated README.md');
			}

			fs.writeFileSync(dir + '/README.md', content, 'utf8');
		};

		/**
		 * Export typescript file
		 *
		 * @param {string} filename
		 * @param {boolean} isLegacy
		 */
		const exportTS = (filename, isLegacy = false) => {
			fs.writeFileSync(
				filename + '.d.ts',
				isLegacy ? iconLegacyType : iconType
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

			// Check if data has legacy attributes
			let isLegacy = false;
			if (options.definitions) {
				legacyAttributes.forEach((attr) => {
					if (data[attr] !== void 0) {
						isLegacy = true;
					}
				});
			}

			// Save uncompiled file
			if (typeof options.sources === 'string') {
				code = 'let data = ' + content + ';\nexport default data;\n';
				fs.writeFileSync(
					dir + options.sources + '/' + name + '.js',
					code,
					'utf8'
				);
				if (options.definitions) {
					exportTS(dir + options.sources + '/' + name, isLegacy);
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
					exportTS(dir + options.compiled + '/' + name, isLegacy);
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
			positionAttributes.forEach((attr) => {
				if (svg[attr] !== 0) {
					json[attr] = svg[attr];
				}
			});

			// Add transformations
			transformKeys.forEach((attr) => {
				if (svg[attr] !== void 0) {
					json[attr] = svg[attr];
				}
			});

			// Include inline attributes
			if (options.includeInline) {
				inlineAttributes.forEach((attr) => {
					if (svg[attr] !== void 0) {
						json[attr] = svg[attr];
					}
				});
			}

			exportIcon(key, json);

			// Export aliases
			(svg.aliases ? svg.aliases : []).forEach((alias) => {
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

						transformKeys.forEach((key) => {
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
};

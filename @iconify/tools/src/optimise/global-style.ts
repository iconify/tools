import {
	splitClassName,
	type ParsedXMLTagElement,
} from '@cyberalien/svg-utils';
import type { SVG } from '../svg';
import { allValidTags, animateTags } from '../svg/data/tags';
import { parseSVG } from '../svg/parse';
import { parseSVGStyle } from '../svg/parse-style';

const tempDataAttrbiute = 'data-gstyle-temp';

/**
 * Expand global style
 */
export function cleanupGlobalStyle(svg: SVG) {
	const backup = svg.toString();
	let containsTempAttr = false;

	// Find all animated classes
	const animatedClasses: Set<string> = new Set();
	parseSVG(svg, (item) => {
		const node = item.node;
		const attribs = node.attribs;
		const tagName = node.tag;

		if (!animateTags.has(tagName)) {
			return;
		}
		if (attribs['attributeName'] !== 'class') {
			return;
		}

		['from', 'to', 'values'].forEach((attr) => {
			const value = attribs[attr];
			if (typeof value !== 'string') {
				return;
			}
			value.split(';').forEach((item) => {
				splitClassName(item).forEach((className) => {
					animatedClasses.add(className);
				});
			});
		});
	});

	// List of classes to remove
	const removeClasses: Set<string> = new Set();

	// Parse style
	try {
		parseSVGStyle(svg, (styleItem) => {
			const returnValue = styleItem.value;
			if (styleItem.type !== 'global') {
				return returnValue;
			}

			// Do not handle media queries
			const selectorTokens = styleItem.selectorTokens;
			for (let i = 0; i < selectorTokens.length; i++) {
				const selectorToken = selectorTokens[i];
				if (selectorToken.type !== 'selector') {
					return returnValue;
				}
			}

			// Parse each selectors
			const selectors = styleItem.selectors;
			type MatchType = 'id' | 'class' | 'tag';
			interface Match {
				type: MatchType;
				value: string;
			}
			const matches: Match[] = [];
			for (let i = 0; i < selectors.length; i++) {
				const selector = styleItem.selectors[i];
				const firstChar = selector.charAt(0);

				let matchType: MatchType;
				if (firstChar === '.') {
					matchType = 'class';
				} else if (firstChar === '#') {
					matchType = 'id';
				} else if (allValidTags.has(selector)) {
					matchType = 'tag';
				} else {
					return returnValue;
				}

				const valueMatch =
					matchType === 'tag' ? selector : selector.slice(1);
				if (matchType === 'class' && animatedClasses.has(valueMatch)) {
					// Class name is used in animations
					return returnValue;
				}

				matches.push({
					type: matchType,
					value: valueMatch,
				});
			}

			// Check if element is a match
			const isMatch = (
				tagName: string,
				node: ParsedXMLTagElement
			): boolean => {
				const attribs = node.attribs;
				for (let i = 0; i < matches.length; i++) {
					const { type, value } = matches[i];
					switch (type) {
						case 'id':
							if (attribs.id === value) {
								return true;
							}
							break;

						case 'tag':
							if (tagName === value) {
								return true;
							}
							break;

						case 'class': {
							const className = attribs['class'];
							if (
								typeof className === 'string' &&
								splitClassName(className).includes(value)
							) {
								return true;
							}
						}
					}
				}

				return false;
			};

			// Parse all elements
			parseSVG(svg, (svgItem) => {
				const node = svgItem.node;
				const tagName = node.tag;

				if (!isMatch(tagName, node)) {
					return;
				}

				// Transfer attribute
				const attribs = node.attribs;
				const tempDataValue = attribs[tempDataAttrbiute];
				const addedAttributes = new Set(
					typeof tempDataValue === 'string'
						? splitClassName(tempDataValue)
						: []
				);

				const prop = styleItem.prop;
				if (attribs[prop] !== undefined) {
					// Previously added attribute?
					if (addedAttributes.has(prop)) {
						// Two CSS rules are applied to same element: abort parsing and restore content from backup.
						// This parse is very basic, it does not account for specificity.
						throw new Error('Duplicate attribute');
					}
				}

				attribs[prop] = styleItem.value;
				addedAttributes.add(prop);
				attribs[tempDataAttrbiute] =
					Array.from(addedAttributes).join(' ');
				containsTempAttr = true;
			});

			// Mark class for removal
			matches.forEach((match) => {
				if (match.type === 'class') {
					removeClasses.add(match.value);
				}
			});
		});

		// Remove classes
		parseSVG(svg, (svgItem) => {
			const node = svgItem.node;
			const attribs = node.attribs;

			// Get list of classes
			const className = attribs['class'];
			const classList =
				typeof className === 'string'
					? splitClassName(className)
					: undefined;
			if (!classList) {
				return;
			}

			const filtered = classList.filter(
				(item) => !removeClasses.has(item)
			);
			if (!filtered.length) {
				delete attribs['class'];
			} else {
				attribs['class'] = filtered.join(' ');
			}
		});

		// Remove temporary attributes
		if (containsTempAttr) {
			parseSVG(svg, (item) => {
				delete item.node.attribs[tempDataAttrbiute];
			});
		}
	} catch {
		// Failed: restore from backup
		svg.load(backup);
	}
}

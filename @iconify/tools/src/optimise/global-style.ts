import type { SVG } from '../svg';
import {} from '../svg/data/attributes';
import { allValidTags, animateTags } from '../svg/data/tags';
import { parseSVG, ParseSVGCallbackItem } from '../svg/parse';
import { parseSVGStyle } from '../svg/parse-style';

function getClassList(value: string): string[];
function getClassList(value: string | undefined): string[] | undefined;
function getClassList(value: string | undefined): string[] | undefined {
	return value?.split(/\s+/);
}

const tempDataAttrbiute = 'data-gstyle-temp';

/**
 * Expand global style
 */
export async function cleanupGlobalStyle(svg: SVG): Promise<void> {
	const backup = svg.toString();
	let containsTempAttr = false;

	// Find all animated classes
	const animatedClasses: Set<string> = new Set();
	await parseSVG(svg, (item) => {
		if (!animateTags.has(item.tagName)) {
			return;
		}
		const $element = item.$element;
		if ($element.attr('attributeName') !== 'class') {
			return;
		}

		['from', 'to', 'values'].forEach((attr) => {
			const value = $element.attr(attr);
			if (typeof value !== 'string') {
				return;
			}
			value.split(';').forEach((item) => {
				getClassList(item).forEach((className) => {
					animatedClasses.add(className);
				});
			});
		});
	});

	// List of classes to remove
	const removeClasses: Set<string> = new Set();

	// Parse style
	try {
		await parseSVGStyle(svg, async (styleItem) => {
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
				$element: ParseSVGCallbackItem['$element']
			): boolean => {
				for (let i = 0; i < matches.length; i++) {
					const { type, value } = matches[i];
					switch (type) {
						case 'id':
							if ($element.attr('id') === value) {
								return true;
							}
							break;

						case 'tag':
							if (tagName === value) {
								return true;
							}
							break;

						case 'class': {
							const className = $element.attr('class');
							if (
								className &&
								getClassList(className).indexOf(value) !== -1
							) {
								return true;
							}
						}
					}
				}

				return false;
			};

			// Parse all elements
			await parseSVG(svg, (svgItem) => {
				const tagName = svgItem.tagName;
				const $element = svgItem.$element;
				if (!isMatch(tagName, $element)) {
					return;
				}

				// Transfer attribute
				const addedAttributes = new Set(
					$element.attr(tempDataAttrbiute)?.split(/\s+/)
				);

				const prop = styleItem.prop;
				if ($element.attr(prop) !== void 0) {
					// Previously added attribute?
					if (addedAttributes.has(prop)) {
						// Two CSS rules are applied to same element: abort parsing and restore content from backup.
						// This parse is very basic, it does not account for specificity.
						throw new Error('Duplicate attribute');
					}
				}

				$element.attr(prop, styleItem.value);
				addedAttributes.add(prop);
				$element.attr(
					tempDataAttrbiute,
					Array.from(addedAttributes).join(' ')
				);
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
		await parseSVG(svg, (svgItem) => {
			const $element = svgItem.$element;

			// Get list of classes
			const classList = getClassList($element.attr('class'));
			if (!classList) {
				return;
			}

			const filtered = classList.filter(
				(item) => !removeClasses.has(item)
			);
			if (!filtered.length) {
				$element.removeAttr('class');
			} else {
				$element.attr('class', filtered.join(' '));
			}
		});

		// Remove temporary attributes
		if (containsTempAttr) {
			await parseSVG(svg, (item) => {
				item.$element.removeAttr(tempDataAttrbiute);
			});
		}
	} catch (err) {
		// Failed: restore from backup
		svg.load(backup);
	}
}

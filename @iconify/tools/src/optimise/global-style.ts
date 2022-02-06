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

	// Parse style
	try {
		await parseSVGStyle(svg, async (styleItem) => {
			const returnValue = styleItem.value;
			if (styleItem.type !== 'global') {
				return returnValue;
			}

			// Handle only simple selectors
			if (
				styleItem.selectors.length !== 1 ||
				styleItem.selectorTokens.length !== 1
			) {
				return returnValue;
			}

			// Do not handle media queries
			const selectorToken = styleItem.selectorTokens[0];
			if (selectorToken.type !== 'selector') {
				return returnValue;
			}

			// Simple selector and simple rule
			const selector = styleItem.selectors[0];
			const firstChar = selector.charAt(0);

			type MatchType = 'id' | 'class' | 'tag';
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

			// Check if element is a match
			const isMatch = (
				tagName: string,
				$element: ParseSVGCallbackItem['$element']
			): boolean => {
				switch (matchType) {
					case 'id':
						return $element.attr('id') === valueMatch;

					case 'tag':
						return tagName === valueMatch;

					case 'class': {
						const className = $element.attr('class');
						if (
							!className ||
							getClassList(className).indexOf(valueMatch) === -1
						) {
							return false;
						}
					}
				}

				return true;
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

			// Remove class attribute
			if (
				matchType === 'class' &&
				styleItem.nextTokens[0]?.type === 'close'
			) {
				// Can remove class
				await parseSVG(svg, (svgItem) => {
					const $element = svgItem.$element;
					if (!isMatch('', $element)) {
						return;
					}

					// Remove class
					const classList = getClassList($element.attr('class'));
					if (!classList) {
						return;
					}

					const filtered = classList.filter(
						(item) => item !== valueMatch
					);
					if (!filtered.length) {
						$element.removeAttr('class');
					} else {
						$element.attr('class', filtered.join(' '));
					}
				});
			}

			// Remove rule
			return;
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

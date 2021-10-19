import type { SVG } from '..';
import { parseInlineStyle } from '../../css/parse';
import {
	badAttributes,
	badSoftwareAttributePrefixes,
	badSoftwareAttributes,
	insideClipPathAttributes,
	tagSpecificAnimatedAttributes,
	tagSpecificNonPresentationalAttributes,
	tagSpecificPresentationalAttributes,
} from '../data/attributes';
import { parseSVG } from '../parse';

/**
 * Expand inline style
 */
export async function cleanupInlineStyle(svg: SVG): Promise<void> {
	await parseSVG(svg, (item) => {
		const $element = item.$element;
		const attribs = item.element.attribs;
		const tagName = item.tagName;

		// Expand style
		if (attribs.style) {
			const parsedStyle = parseInlineStyle(attribs.style);
			if (parsedStyle === null) {
				// Ignore style
				$element.removeAttr('style');
			} else {
				const newStyle: Record<string, string> = Object.create(null);

				const checkRule = (prop: string, value: string) => {
					function warn() {
						console.warn(
							`Removing unexpected style on "${tagName}": ${prop}`
						);
					}

					// Check for bad attributes that should be removed
					if (
						badAttributes.has(prop) ||
						tagSpecificNonPresentationalAttributes[tagName]?.has(
							prop
						)
					) {
						return;
					}

					// Valid attributes
					if (
						tagSpecificAnimatedAttributes[tagName]?.has(prop) ||
						tagSpecificPresentationalAttributes[tagName]?.has(prop)
					) {
						$element.attr(prop, value);
						return;
					}

					// Attributes inside <clipPath>
					if (insideClipPathAttributes.has(prop)) {
						if (
							item.parents.find(
								(item) => item.tagName === 'clipPath'
							)
						) {
							$element.attr(prop, value);
						}
						return;
					}

					// Bad software stuff
					if (
						badSoftwareAttributes.has(prop) ||
						badSoftwareAttributePrefixes.has(
							prop.split('-').shift() as string
						)
					) {
						return;
					}

					// Vendor specific junk
					if (prop.slice(0, 1) === '-') {
						return;
					}

					// Unknown
					warn();
				};

				// Check all properties
				for (const prop in parsedStyle) {
					checkRule(prop, parsedStyle[prop]);
				}

				// Update style
				const newStyleStr = Object.keys(newStyle)
					.map((key) => key + ':' + newStyle[key] + ';')
					.join('');
				if (newStyleStr.length) {
					$element.attr('style', newStyleStr);
				} else {
					$element.removeAttr('style');
				}
			}
		}
	});
}

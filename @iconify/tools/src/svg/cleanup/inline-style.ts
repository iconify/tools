import type { SVG } from '../../svg';
import { parseInlineStyle } from '../../css/parse';
import {
	badAttributes,
	badAttributePrefixes,
	badSoftwareAttributes,
	insideClipPathAttributes,
	tagSpecificAnimatedAttributes,
	tagSpecificNonPresentationalAttributes,
	tagSpecificPresentationalAttributes,
	tagSpecificInlineStyles,
} from '../data/attributes';
import { parseSVGSync } from '../parse';

/**
 * Allowed rules
 *
 * Contains full rules + partial rules.
 * Partial rule = first part of rule split by '-' + '*'
 */
const allowedStyleRules: Set<string> = new Set([
	// Animations
	'animation',
	'animation*',
	'offset',
	'offset*',
	// Transformations
	'transform',
	'transform*',
	'translate',
	// Transitions
	'transition',
	'transition*',
]);

/**
 * Known ignored rules, exported by junk software
 *
 * Full or partial (see above)
 *
 * Checked after tag specific attributes, so list contains some valid attributes, but when used in wrong place
 */
const knownIgnoredRules: Set<string> = new Set([
	// Illustrator / Inkscape junk
	'solid*',
	'paint*',
	'shape*',
	'color-interpolation-filters',
	'stop-opacity',
]);

/**
 * Expand inline style
 */
export function cleanupInlineStyle(svg: SVG): void {
	parseSVGSync(svg, (item) => {
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
				const newStyle = Object.create(null) as Record<string, string>;

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

					// Valid style that cannot be converted to attribute
					const partial = (prop.split('-').shift() as string) + '*';
					if (
						tagSpecificInlineStyles[tagName]?.has(prop) ||
						allowedStyleRules.has(prop) ||
						allowedStyleRules.has(partial)
					) {
						newStyle[prop] = value;
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
						badAttributePrefixes.has(
							prop.split('-').shift() as string
						) ||
						knownIgnoredRules.has(prop) ||
						knownIgnoredRules.has(partial)
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

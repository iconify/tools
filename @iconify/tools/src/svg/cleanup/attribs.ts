import type { SVG } from '../../svg';
import {
	badAttributes,
	badAttributePrefixes,
	badSoftwareAttributes,
	tagSpecificPresentationalAttributes,
} from '../data/attributes';
import { defsTag } from '../data/tags';
import { parseSVG } from '../parse';

/**
 * Remove useless attributes
 */
export async function removeBadAttributes(svg: SVG): Promise<void> {
	await parseSVG(svg, (item) => {
		const tagName = item.tagName;
		const attribs = item.element.attribs;
		const $element = item.$element;

		// Common tags
		Object.keys(attribs).forEach((attr) => {
			// Bad attributes, events
			if (
				attr.slice(0, 2) === 'on' ||
				badAttributes.has(attr) ||
				badSoftwareAttributes.has(attr) ||
				badAttributePrefixes.has(attr.split('-').shift() as string)
			) {
				$element.removeAttr(attr);
				return;
			}

			// Attributes on <defs> aren't passed to child nodes, so remove everything)
			if (
				defsTag.has(tagName) &&
				!tagSpecificPresentationalAttributes[tagName].has(attr)
			) {
				$element.removeAttr(attr);
				return;
			}

			// Check for namespace
			const nsParts = attr.split(':');
			if (nsParts.length > 1) {
				const namespace = nsParts.shift();
				const newAttr = nsParts.join(':');
				switch (namespace) {
					case 'xlink': {
						// Deprecated: use without namespace
						if (attribs[newAttr] === void 0) {
							$element.attr(newAttr, attribs[attr]);
						}
						break;
					}
				}

				// Remove all namespace attributes
				$element.removeAttr(attr);
			}
		});
	});
}

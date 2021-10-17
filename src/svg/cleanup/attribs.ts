import type { SVG } from '..';
import { badAttributes } from '../data/attributes';
import { parseSVG } from '../parse';

/**
 * Remove useless attributes
 */
export async function removeBadAttributes(svg: SVG): Promise<void> {
	parseSVG(svg, (item) => {
		const attribs = item.element.attribs;

		// Common tags
		Object.keys(attribs).forEach((attr) => {
			// Bad attributes, events
			if (attr.slice(0, 2) === 'on' || badAttributes.has(attr)) {
				item.$element.removeAttr(attr);
				return;
			}

			// Partial attribute matches
			const parts = attr.split('-');
			const firstPart = parts.shift();
			switch (firstPart) {
				case '': // -whatever
				case 'aria':
				case 'data':
					// Remove unnecessary attributes
					item.$element.removeAttr(attr);
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
							item.$element.attr(newAttr, attribs[attr]);
						}
						break;
					}
				}
				// Remove all namespace attributes
				item.$element.removeAttr(attr);
			}
		});
	});
}

import { stringifyXMLContent } from '@cyberalien/svg-utils';
import type { SVG } from '../svg';

/**
 * Removes empty group from SVG root element
 */
export function unwrapEmptyGroup(svg: SVG) {
	const root = svg.$svg;

	if (root.children.length !== 1) {
		return;
	}
	const groupNode = root.children[0];

	if (
		groupNode.type !== 'tag' ||
		groupNode.tag !== 'g' ||
		!groupNode.children.length
	) {
		return;
	}

	// Check attributes
	const html = stringifyXMLContent(groupNode.children);
	for (const attr in groupNode.attribs) {
		const value = groupNode.attribs[attr];
		if (typeof value !== 'string') {
			continue;
		}
		switch (attr) {
			case 'id': {
				// Check if ID is used
				if (html?.includes(value)) {
					// ID is used
					return;
				}
				break;
			}

			default:
				// Unknown attribute: do not mess with it
				return;
		}
	}

	// Unwrap group
	root.children = groupNode.children;
}

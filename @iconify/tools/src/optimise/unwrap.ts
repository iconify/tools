import type { SVG } from '../svg';

/**
 * Removes empty group from SVG root element
 */
export function unwrapEmptyGroup(svg: SVG) {
	const cheerio = svg.$svg;
	const $root = svg.$svg(':root');
	const children = $root.children();

	if (children.length !== 1 || children[0].tagName !== 'g') {
		return;
	}
	const groupNode = children[0];
	const html = cheerio(groupNode).html();
	if (!html) {
		return;
	}

	// Check attributes
	for (const attr in groupNode.attribs) {
		const value = groupNode.attribs[attr];
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
	$root.html(html);
}

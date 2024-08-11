import { colorToString, stringToColor } from '@iconify/utils';
import type { CheerioElement } from '../misc/cheerio';
import { SVG } from '../svg';
import { cleanupInlineStyle } from '../svg/cleanup/inline-style';
import { defsTag, maskTags, symbolTag } from '../svg/data/tags';
import { parseSVG } from '../svg/parse';
import { unwrapEmptyGroup } from './unwrap';

/**
 * Checks if number is tiny, used to remove bad Figma transformations
 */
function isTinyNumber(value: string, limit: number): boolean {
	const num = parseInt(value);
	return !isNaN(num) && Math.abs(num) < limit;
}

interface CheckClipPathResult {
	node: CheerioElement;
	attribs: Record<string, string>;
}

/**
 * Check node
 *
 * Returns CheckClipPathResult on success, false on error
 */
function checkClipPathNode(
	clipNode: CheerioElement,
	expectedWidth: number,
	expectedHeight: number
): CheckClipPathResult | false {
	// Check for other attributes on clipPath element
	for (const attr in clipNode.attribs) {
		if (attr !== 'id') {
			// Unexpected attribute
			return false;
		}
	}

	// Check child nodes: should have only <rect />
	// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
	const children = clipNode.children.filter((node) => node.type !== 'text');
	if (children.length !== 1) {
		return false;
	}

	const childNode = children[0];
	// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
	if (childNode.type !== 'tag' || childNode.children.length) {
		// Not tag or has children
		return false;
	}

	const attribs = {
		...childNode.attribs,
	};
	delete attribs['fill'];

	// Check for fill: should be white or undefined
	const fill = childNode.attribs['fill'];
	const colorValue = fill ? stringToColor(fill) : null;
	const colorString = colorValue ? colorToString(colorValue) : null;
	if (fill && colorString !== '#fff') {
		console.warn(
			'Unxepected fill on clip path:',
			childNode.attribs['fill']
		);
		return false;
	}

	// Check tag
	switch (childNode.tagName) {
		case 'rect': {
			const width = parseInt(childNode.attribs['width']);
			const height = parseInt(childNode.attribs['height']);
			if (width !== expectedWidth || height !== expectedHeight) {
				console.warn('Invalid size of clip path');
				return false;
			}
			delete attribs['width'];
			delete attribs['height'];
			break;
		}

		default:
			// Invalid tag
			console.warn(
				'Unexpected tag in Figma clip path:',
				childNode.tagName
			);
			return false;
	}

	// Check attributes
	Object.keys(attribs).forEach((attr) => {
		const value = attribs[attr];
		switch (attr) {
			case 'transform': {
				// Remove sub-pixel translate, which is sometimes added by Figma if grid is not precise
				const translateStart = 'translate(';
				const translateEnd = ')';
				if (
					value.startsWith(translateStart) &&
					value.endsWith(translateEnd)
				) {
					const translateParts = value
						.slice(translateStart.length, 0 - translateEnd.length)
						.split(/\s+/);
					const limit =
						Math.min(expectedWidth, expectedHeight) / 1000;
					if (
						translateParts.length === 2 &&
						isTinyNumber(translateParts[0], limit) &&
						isTinyNumber(translateParts[1], limit)
					) {
						// Tiny irrelevant translate
						delete attribs[attr];
					}
				}
			}
		}
	});
	return {
		node: clipNode,
		attribs,
	};
}

// Extract id from url(#id)
const urlStart = 'url(#';
const urlEnd = ')';

/**
 * Does the job
 *
 * Can mess with SVG because on failure backup will be restored
 */
function remove(svg: SVG): boolean {
	// Remove empty group that might be present at root
	unwrapEmptyGroup(svg);

	// HTML changes
	let content = svg.toString();
	const backup = content;
	const isPenpot = content.includes('frame-clip-def');

	// Clean up Penpot mess
	if (isPenpot) {
		cleanupInlineStyle(svg);
		parseSVG(svg, (item) => {
			const tagName = item.tagName;
			for (const attr in item.element.attribs) {
				const value = item.element.attribs[attr];
				switch (attr) {
					case 'id':
						// Keep ID only in clip paths, masks and symbols
						if (!maskTags.has(tagName) && !symbolTag.has(tagName)) {
							item.$element.removeAttr(attr);
						}
						break;

					case 'class':
					case 'xmlns:xlink':
					case 'version':
						// Class is not used, other attributes are junk
						item.$element.removeAttr(attr);
						break;

					case 'transform': {
						// Remove empty transforms
						const trimmed = value
							.replace(/\s+/g, '')
							.replace(/\.0+/g, '');
						if (!trimmed || trimmed === 'matrix(1,0,0,1,0,0)') {
							item.$element.removeAttr(attr);
						}
						break;
					}

					case 'rx':
					case 'ry':
					case 'x':
					case 'y':
						// Remove unnecessary attributes
						if (value === '0') {
							item.$element.removeAttr(attr);
						}
						break;

					case 'fill-opacity':
					case 'stroke-opacity':
					case 'opacity':
						// Remove unnecessary attributes
						if (value === '1') {
							item.$element.removeAttr(attr);
						}
						break;

					case 'fill':
					case 'stroke': {
						// Clean up colors
						const colorValue = stringToColor(value);
						if (colorValue?.type === 'rgb') {
							item.$element.attr(attr, colorToString(colorValue));
						}
					}
				}
			}
		});
		content = svg.toString();
	}

	// Check for duplicate clip paths (Penpot bug)
	const clipPathBlocks = content.match(
		/<clipPath[^>]*>[\s\S]+?<\/clipPath>/g
	);
	if (
		clipPathBlocks?.length === 2 &&
		clipPathBlocks[0] === clipPathBlocks[1]
	) {
		const split = clipPathBlocks[0];
		const lines = content.split(split);
		content = lines.shift()! + split + lines.join('');
	}

	// Remove <defs> to simplify parsing
	if (content.includes('<defs>')) {
		content = content.replace(/<\/?defs>/g, '');
	}

	if (content !== backup) {
		svg.load(content);
	}

	// Split clip path and shapes
	const cheerio = svg.$svg;
	const $root = svg.$svg(':root');
	const children = $root.children();

	// Shapes
	const shapesToClip: CheerioElement[] = [];

	// Find expected clip path id
	let clipID: string | undefined;
	for (let i = 0; i < children.length; i++) {
		const node = children[i];
		// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
		if (node.type === 'tag') {
			const tagName = node.tagName;
			if (
				!defsTag.has(tagName) &&
				!maskTags.has(tagName) &&
				!symbolTag.has(tagName)
			) {
				// Tag should have clip path
				const clipPath = node.attribs['clip-path'];
				if (
					!clipPath ||
					!clipPath.startsWith(urlStart) ||
					!clipPath.endsWith(urlEnd)
				) {
					return false;
				}

				const id = clipPath.slice(urlStart.length, 0 - urlEnd.length);
				if (typeof clipID === 'string' && clipID !== id) {
					// Multiple clip paths are not supported
					// Need test case
					return false;
				}

				clipID = id;
				shapesToClip.push(node);
			}
		}
	}
	if (typeof clipID !== 'string') {
		return false;
	}

	// Find clip path
	const findClipPath = () => {
		for (let i = 0; i < children.length; i++) {
			const node = children[i];
			// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
			if (node.type === 'tag' && node.tagName === 'clipPath') {
				const id = node.attribs['id'];
				if (id === clipID) {
					// Found clip path: check it
					const result = checkClipPathNode(
						node,
						svg.viewBox.width,
						svg.viewBox.height
					);

					// Remove element
					cheerio(node).remove();
					return result;
				}
				return;
			}
		}
	};
	const clipPath = findClipPath();
	if (!clipPath) {
		// No clip path found
		return false;
	}

	// Found clip path node: apply it to elements
	const attribs = clipPath.attribs;
	for (let i = 0; i < shapesToClip.length; i++) {
		const node = shapesToClip[i];
		cheerio(node).removeAttr('clip-path');
		for (const attr in attribs) {
			if (node.attribs[attr] !== undefined) {
				// Conflict!
				return false;
			}
			cheerio(node).attr(attr, attribs[attr]);
		}
	}

	return true;
}

/**
 * Removes clip path from SVG, which Figma and Penpot add to icons that might have overflowing elements.
 * Also removes mess generated by Penpot
 *
 * Function was originally designed for Figma only, but later added support for Penpot
 */
export function removeFigmaClipPathFromSVG(svg: SVG): boolean {
	// Create backup
	const backup = svg.toString();

	// Do stuff
	try {
		if (remove(svg)) {
			return true;
		}
	} catch {
		//
	}

	// Failed
	svg.load(backup);
	return false;
}

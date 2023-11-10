import { SVG } from '../svg';
import { defsTag, maskTags, symbolTag } from '../svg/data/tags';

/**
 * Checks if number is tiny, used to remove bad Figma transformations
 */
function isTinyNumber(value: string, limit: number): boolean {
	const num = parseInt(value);
	return !isNaN(num) && Math.abs(num) < limit;
}

interface CheckClipPathResult {
	node: cheerio.TagElement;
	attribs: Record<string, string>;
}

/**
 * Check node
 *
 * Returns CheckClipPathResult on success, false on error
 */
function checkClipPathNode(
	clipNode: cheerio.TagElement,
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
	const children = clipNode.children.filter((node) => node.type !== 'text');
	if (children.length !== 1) {
		return false;
	}

	const childNode = children[0];
	if (childNode.type !== 'tag' || childNode.children.length) {
		// Not tag or has children
		return false;
	}

	const attribs = {
		...childNode.attribs,
	};
	delete attribs['fill'];

	// Check for fill
	const fill = (childNode.attribs['fill'] ?? '').toLowerCase();
	if (fill !== 'white' && fill !== '#fff' && fill !== '#ffffff') {
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
 * Removes clip path from SVG, which Figma adds to icons that might have overflowing elements
 */
export function removeFigmaClipPathFromSVG(svg: SVG): boolean {
	// Split clip path and shapes
	const cheerio = svg.$svg;
	const $root = svg.$svg(':root');
	const children = $root.children();

	// Create backup
	const backup = svg.toString();

	// Shapes
	const shapesToClip: cheerio.TagElement[] = [];

	// Find expected clip path id
	let clipID: string | undefined;
	for (let i = 0; i < children.length; i++) {
		const node = children[i];
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

	// Check clip path node
	// Returns CheckClipPathResult on success, false on error, undefined if this is not clip path we need
	const checkClipPath = (node: cheerio.TagElement) => {
		const id = node.attribs['id'];
		if (id !== clipID) {
			return;
		}

		// Found clip path: check it
		const result = checkClipPathNode(
			node,
			svg.viewBox.width,
			svg.viewBox.height
		);

		// Remove element
		cheerio(node).remove();
		return result;
	};

	// Find clip path
	const findClipPath = () => {
		for (let i = 0; i < children.length; i++) {
			const node = children[i];
			if (node.type === 'tag') {
				const tagName = node.tagName;
				if (defsTag.has(tagName)) {
					// Check child elements
					const defsChildren = node.children;
					for (let j = 0; j < defsChildren.length; j++) {
						const childNode = defsChildren[j];
						if (
							childNode.type === 'tag' &&
							childNode.tagName === 'clipPath'
						) {
							const result = checkClipPath(childNode);
							if (result !== undefined) {
								// Check if <defs> is empty
								const validChildren = node.children.filter(
									(test) => {
										if (test.type === 'text') {
											return false;
										}
										return true;
									}
								);
								if (!validChildren.length) {
									cheerio(node).remove();
								}

								return result;
							}
						}
					}
				}

				if (tagName === 'clipPath') {
					const result = checkClipPath(node);
					if (result !== undefined) {
						return result;
					}
				}
			}
		}
	};
	const clipPath = findClipPath();
	if (!clipPath) {
		// Restore backup and return
		svg.load(backup);
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
				svg.load(backup);
				return false;
			}
			cheerio(node).attr(attr, attribs[attr]);
		}
	}

	return true;
}

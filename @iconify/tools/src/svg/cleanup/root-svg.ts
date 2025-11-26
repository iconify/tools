import type { ParsedXMLTagElement } from '@cyberalien/svg-utils';
import type { SVG } from '../../svg';
import {
	badAttributes,
	badAttributePrefixes,
	badSoftwareAttributes,
	commonAttributes,
	junkSVGAttributes,
	stylingAttributes,
	tagSpecificNonPresentationalAttributes,
	tagSpecificPresentationalAttributes,
} from '../data/attributes';
import { maskTags, reusableElementsWithPalette } from '../data/tags';

/**
 * Clean up SVG
 */
export function cleanupSVGRoot(svg: SVG) {
	const root = svg.$svg;
	const tagName = 'svg';
	if (root.tag !== tagName) {
		throw new Error(`Unexpected root tag <${root.tag}>`);
	}
	const attribs = root.attribs;

	// Check attributes
	const moveToChildren = Object.create(null) as typeof attribs;
	Object.keys(attribs).forEach((attr) => {
		const value = attribs[attr];

		// Bad attributes, irrelevant common attributes, namespaces
		if (
			commonAttributes.has(attr) ||
			badAttributes.has(attr) ||
			junkSVGAttributes.has(attr) ||
			badSoftwareAttributes.has(attr) ||
			badAttributePrefixes.has(attr.split('-').shift() as string) ||
			attr.split(':').length > 1
		) {
			delete attribs[attr];
			return;
		}

		// Special handling for dimensions
		switch (attr) {
			case 'width':
			case 'height':
				// Cleanup dimensions
				if (typeof value !== 'string') {
					// Number
					return;
				}
				if (value.slice(-2) === 'px') {
					// Remove 'px'
					const num = value.replace('px', '');
					if (parseFloat(num).toString() === num) {
						attribs[attr] = num;
					}
				}
				return;
		}

		// Attributes that belong to <svg>
		if (tagSpecificNonPresentationalAttributes[tagName]?.has(attr)) {
			return;
		}

		// Presentational attributes: move to child elements
		if (
			tagSpecificPresentationalAttributes[tagName]?.has(attr) &&
			tagSpecificPresentationalAttributes.g.has(attr)
		) {
			moveToChildren[attr] = value;
			delete attribs[attr];
			return;
		}

		// Styling: 'style' should be checked by expandInlineStyle(), remove others
		if (stylingAttributes.has(attr)) {
			switch (attr) {
				case 'style':
					return;

				case 'class':
					delete attribs[attr];
					return;
			}
			throw new Error(`Unexpected attribute "${attr}" on <${tagName}>`);
		}

		// Junk from bad editors, mostly Adobe Illustrator and Inkscape
		if (
			// Events
			attr.slice(0, 2) === 'on' ||
			// aria-stuff
			attr.slice(0, 5) === 'aria-' ||
			// Junk
			attr.slice(0, 6) === 'xmlns:'
		) {
			delete attribs[attr];
			return;
		}

		console.warn(`Removing unexpected attribute on SVG: ${attr}`);
		delete attribs[attr];
	});

	if (Object.keys(moveToChildren).length) {
		// Wrap child elements
		const nodesToMove = root.children;
		const wrapper: ParsedXMLTagElement = {
			type: 'tag',
			tag: 'g',
			attribs: moveToChildren,
			children: [],
		};
		root.children = [];

		for (const child of nodesToMove) {
			if (child.type !== 'tag') {
				wrapper.children.push(child);
				continue;
			}

			const tagName = child.tag;
			if (
				tagName === 'style' ||
				tagName === 'title' ||
				reusableElementsWithPalette.has(tagName) ||
				maskTags.has(tagName)
			) {
				// Do not wrap these elements
				root.children.push(child);
			} else {
				wrapper.children.push(child);
			}
		}
		root.children.push(wrapper);
	}
}

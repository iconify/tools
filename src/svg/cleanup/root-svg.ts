import type { SVG } from '..';
import {
	badAttributes,
	badSoftwareAttributes,
	commonAttributes,
	junkSVGAttributes,
	stylingAttributes,
	tagSpecificNonPresentationalAttributes,
	tagSpecificPresentationalAttributes,
} from '../data/attributes';
import { maskAndSymbolTags } from '../data/tags';

/**
 * Clean up SVG
 */
export async function cleanupSVGRoot(svg: SVG): Promise<void> {
	const cheerio = svg.$svg;
	const $root = svg.$svg(':root');
	const root = $root.get(0) as cheerio.TagElement;
	const tagName = 'svg';
	if (root.tagName !== tagName) {
		throw new Error(`Unexpected root tag <${root.tagName}>`);
	}
	const attribs = root.attribs;

	// Check attributes
	const moveToChildren: typeof attribs = {};
	Object.keys(attribs).forEach((attr) => {
		const value = attribs[attr];

		// Bad attributes, irrelevant common attributes
		if (
			badAttributes.has(attr) ||
			junkSVGAttributes.has(attr) ||
			badSoftwareAttributes.has(attr) ||
			commonAttributes.has(attr)
		) {
			$root.removeAttr(attr);
			return;
		}

		// Special handling for dimensions
		switch (attr) {
			case 'width':
			case 'height':
				// Cleanup dimensions
				if (value.slice(-2) === 'px') {
					// Remove 'px'
					const num = value.replace('px', '');
					if (parseFloat(num) + '' === num) {
						$root.attr(attr, num);
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
			$root.removeAttr(attr);
			return;
		}

		// Styling: 'style' should be checked by expandInlineStyle(), remove others
		if (stylingAttributes.has(attr)) {
			switch (attr) {
				case 'style':
					return;

				case 'class':
					$root.removeAttr(attr);
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
			$root.removeAttr(attr);
			return;
		}

		console.log(`Removing unexpected attribute on SVG: ${attr}`);
		$root.removeAttr(attr);
	});

	if (Object.keys(moveToChildren).length) {
		// Wrap child elements
		const $wrapper = cheerio('<g />');
		for (const key in moveToChildren) {
			$wrapper.attr(key, moveToChildren[key]);
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
		$root.children().each((index, child) => {
			const $child = cheerio(child);
			if (child.type !== 'tag') {
				$child.appendTo($wrapper);
				return;
			}
			const tagName = child.tagName;
			if (tagName === 'style' || maskAndSymbolTags.has(tagName)) {
				// Do not wrap these elements
				return;
			}
			$child.appendTo($wrapper);
		});

		$wrapper.appendTo($root);
	}
}

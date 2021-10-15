import type { SVG } from '.';
import { checkBadTags } from './cleanup/bad-tags';
import { expandInlineStyle } from './cleanup/inline-style';
import { cleanupSVGRoot } from './cleanup/root-svg';
import { badAttributes } from './data/attributes';
import { parseSVG } from './parse';

/**
 * Clean up SVG
 */
export function cleanupSVG(svg: SVG): void {
	const cheerio = svg.$svg;

	// Expand style
	expandInlineStyle(svg);

	// Cleanup <svg> element
	cleanupSVGRoot(svg);

	// Check for bad tags
	checkBadTags(svg);

	// Other stuf... to be moved to other files later
	parseSVG(svg, (item) => {
		const attribs = item.element.attribs;

		// Common tags
		Object.keys(attribs).forEach((attr) => {
			// Check for nasty stuff
			if (attr.slice(0, 2) === 'on') {
				console.log(
					`Removing unexpected attribute on <${item.tagName}>: ${attr}`
				);
			}

			// Bad attributes
			if (badAttributes.has(attr)) {
				item.$element.removeAttr(attr);
				return;
			}

			// Full attributes
			switch (attr) {
				case 'title':
				case 'role':
					// Remove unnecessary attributes
					item.$element.removeAttr(attr);
					return;
			}

			const parts = attr.split('-');
			const firstPart = parts.shift();
			switch (firstPart) {
				case '': // -whatever
				case 'aria':
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

		// Tag specific stuff
		switch (item.tagName) {
			case 'svg': {
				// Check attributes
				const moveToChildren: typeof attribs = {};
				Object.keys(attribs).forEach((attr) => {
					const value = attribs[attr];
					// Simple attributes
					switch (attr) {
						case 'width':
						case 'height':
							// Cleanup dimensions
							if (value.slice(-2) === 'px') {
								// Remove 'px'
								const num = value.replace('px', '');
								if (parseFloat(num) + '' === num) {
									item.$element.attr(attr, num);
								}
							}
							return;

						case 'xmlns':
						case 'xmlns:xlink':
						case 'viewBox':
						case 'preserveAspectRatio':
							// Ignore default attributes
							return;

						case 'id':
						case 'title':
						case 'version':
						case 'x':
						case 'y':
							// Remove unnecessary attributes
							item.$element.removeAttr(attr);
							return;
					}

					const parts = attr.split(/[:-]/);
					const firstPart = parts.shift();
					switch (firstPart) {
						case 'fill':
						case 'stroke':
							// Move to children
							moveToChildren[attr] = value;
							item.$element.removeAttr(attr);
							return;

						case 'xmlns':
							// Remove
							item.$element.removeAttr(attr);
							return;
					}

					console.log(
						`Removing unexpected attribute on SVG: ${attr}`
					);
					item.$element.removeAttr(attr);
				});

				if (Object.keys(moveToChildren).length) {
					// Wrap child elements
					const wrapper = cheerio('<g />');
					for (const key in moveToChildren) {
						wrapper.attr(key, moveToChildren[key]);
					}
					item.$element.children().wrap(wrapper);
				}
				break;
			}
		}
	});
}

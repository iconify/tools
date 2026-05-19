import type { SVG } from '../index.js';
import {
	badAttributes,
	badAttributePrefixes,
	badSoftwareAttributes,
} from '../data/attributes.js';
import { parseSVGStyle } from '../parse-style.js';
import { runSVGO } from '../../optimise/svgo.js';

/**
 * Expand inline style
 */
export function convertStyleToAttrs(svg: SVG): void {
	let hasStyle = false;

	// Clean up style, removing useless junk
	parseSVGStyle(svg, (item) => {
		if (item.type !== 'inline' && item.type !== 'global') {
			return item.value;
		}

		// Inline or global
		const prop = item.prop;
		if (
			// Attributes / properties now allowed
			badAttributes.has(prop) ||
			badSoftwareAttributes.has(prop) ||
			badAttributePrefixes.has(prop.split('-').shift() as string)
		) {
			return;
		}

		hasStyle = true;
		return item.value;
	});

	// Nothing to check?
	if (!hasStyle) {
		return;
	}

	// Run SVGO
	runSVGO(svg, {
		plugins: ['convertStyleToAttrs', 'inlineStyles'],
		multipass: true,
	});
}

import type { SVG } from '..';
import { badAttributes, badSoftwareAttributes } from '../data/attributes';
import { parseSVGStyle } from '../parse-style';
import { runSVGO } from '../../optimise/svgo';

/**
 * Expand inline style
 */
export async function convertStyleToAttrs(svg: SVG): Promise<void> {
	let hasStyle = false;

	// Clean up style, removing useless junk
	await parseSVGStyle(svg, (item) => {
		const prop = item.prop;
		if (
			// Browser specific junk
			prop.slice(0, 1) === '-' ||
			// Attributes / properties now allowed
			badAttributes.has(prop) ||
			badSoftwareAttributes.has(prop)
		) {
			return void 0;
		}

		hasStyle = true;
		return item.value;
	});

	// Nothing to check?
	if (!hasStyle) {
		return;
	}

	// Run SVGO
	await runSVGO(svg, {
		plugins: ['convertStyleToAttrs', 'inlineStyles'],
		multipass: true,
	});
}

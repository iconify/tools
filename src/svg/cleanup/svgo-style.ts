import { optimize } from 'svgo';
import type { OptimizeOptions } from 'svgo';
import type { SVG } from '..';
// import { parseSVG } from '../parse';
// import { getTokens } from '../../css/parser/tokens';
import { badAttributes, badSoftwareAttributes } from '../data/attributes';
// import { tokensTree } from '../../css/parser/tree';
// import { tokensToString } from '../../css/parser/export';
import { parseSVGStyle } from '../parse-style';

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
	const options: OptimizeOptions = {
		plugins: ['convertStyleToAttrs', 'inlineStyles'],
		multipass: true,
	};

	// Load data
	const result = optimize(svg.toString(), options);
	svg.load(result.data);
}

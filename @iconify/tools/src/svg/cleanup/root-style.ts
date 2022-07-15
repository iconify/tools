import type { SVG } from '..';
import { parseSVGStyle } from '../parse-style';

/**
 * Clean up root style
 *
 * This function removes all at-rule tokens, such as `@font-face`, `@media`
 */
export function cleanupRootStyle(svg: SVG): ReturnType<typeof parseSVGStyle> {
	return parseSVGStyle(svg, (item) => {
		if (
			// If global style
			item.type === 'global' &&
			// If selector tokens contain at-rule
			item.selectorTokens.find((token) => token.type === 'at-rule')
		) {
			// Remove it
			return;
		}
		return item.value;
	});
}

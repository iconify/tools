import { isBadSVGColor, isSVGColorAttribute } from '../svg/data/colors.js';
import { getTokens } from './parser/tokens';

/**
 * Parse inline style
 */
export function parseInlineStyle(style: string): Record<string, string> | null {
	const tokens = getTokens(style);
	if (!(tokens instanceof Array)) {
		return null;
	}

	const results = Object.create(null) as Record<string, string>;
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token.type !== 'rule') {
			return null;
		}

		// Skip bad colors
		if (isSVGColorAttribute(token.prop) && isBadSVGColor(token.value)) {
			continue;
		}

		results[token.prop] = token.value;
	}

	return results;
}

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

		results[token.prop] = token.value;
	}

	return results;
}

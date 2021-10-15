import type {
	CSSATValue,
	CSSRuleToken,
	CSSTokenWithSelector,
	TextToken,
} from './types';

/**
 * Merge text tokens to string
 */
export function mergeTextTokens(tokens: TextToken[]): string {
	return tokens
		.map((token) => token.text)
		.join('')
		.trim();
}

/**
 * Get list of selectors from list of words
 */
export function getSelectors(tokens: TextToken[]): string[] {
	const selectors = [];
	let selector = '';

	tokens.forEach((token) => {
		if (token.type !== 'chunk') {
			// Add entire URL or quoted string
			selector += token.text;
			return;
		}

		// Split by comma
		const list = token.text.split(',');
		selector += list.shift();
		while (list.length > 0) {
			selectors.push(selector.trim());
			selector = list.shift() as string;
		}
	});

	selectors.push(selector.trim());

	// Filter empty entries
	return selectors.filter((item) => item.length > 0);
}

/**
 * Convert text token to rule
 */
export function textTokensToRule(tokens: TextToken[]): CSSRuleToken | null {
	let prop = '';
	let value = '';

	let isProp = true;
	let error = false;

	// Merge all tokens into property and value
	tokens.forEach((token) => {
		if (error) {
			return;
		}

		if (token.type !== 'chunk') {
			// URL or quoted string
			if (isProp) {
				// Cannot have URL or quoted string in property
				error = true;
			} else {
				value += token.text;
			}
			return;
		}

		// Code token
		const pairs = token.text.split(':');
		if (pairs.length > 2) {
			// Too many ':' in code
			error = true;
			return;
		}

		if (pairs.length === 2) {
			if (!isProp) {
				// Double ':' in code
				error = true;
				return;
			}

			prop += pairs[0];
			value = pairs[1];
			isProp = false;
			return;
		}

		// Add content to property or value
		if (isProp) {
			prop += token.text;
		} else {
			value += token.text;
		}
	});

	if (error || isProp) {
		// Error or still assembling a property
		return null;
	}
	prop = prop.trim();
	value = value.trim();
	if (!prop.length || !value.length) {
		return null;
	}

	const result: CSSRuleToken = {
		type: 'rule',
		prop: prop.toLowerCase(),
		value: value,
		index: tokens[0].index,
	};

	// Check for !important (with possibility to support other stuff like !default in future)
	(['important'] as 'important'[]).forEach((word) => {
		if (
			result.value.slice(0 - word.length - 1).toLowerCase() ===
			'!' + word
		) {
			result[word] = true;
			result.value = result.value
				.slice(0, result.value.length - word.length - 1)
				.trim();
		}
	});

	// Value cannot be empty
	return result.value.length ? result : null;
}

// Rules that needs extra parsing
const nestableAtRules = ['media', 'supports'];

/**
 * Create at-rule or selector token from text tokens
 */
export function textTokensToSelector(
	tokens: TextToken[]
): CSSTokenWithSelector | null {
	const selectors = getSelectors(tokens);
	const code = mergeTextTokens(tokens);
	const index = tokens[0].index;

	if (!selectors.length) {
		return null;
	}

	if (selectors[0].charAt(0) === '@') {
		const atRule = selectors[0].split(/\s+/, 1)[0].slice(1).toLowerCase();
		selectors[0] = selectors[0].slice(1 + atRule.length).trim();
		const atValues = selectors as CSSATValue[];

		// Remove parenthesis for at-rules that can be nested, such as @media
		if (nestableAtRules.indexOf(atRule) !== -1) {
			atValues.forEach((item, index) => {
				if (
					typeof item !== 'string' ||
					item.charAt(0) !== '(' ||
					item.charAt(item.length - 1) !== ')'
				) {
					return;
				}

				const list = item
					.slice(1, item.length - 1)
					.split(/\)\s?and\s?\(/i)
					.map((item) => item.trim());
				let match = true;
				list.forEach((item) => {
					if (item.indexOf('(') !== -1 || item.indexOf(')') !== -1) {
						match = false;
					}
				});

				if (match) {
					atValues[index] = list;
				}
			});
		}

		return {
			type: 'at-rule',
			code,
			index,
			atRule,
			atValues,
		};
	} else {
		return {
			type: 'selector',
			code,
			index,
			selectors,
		};
	}
}

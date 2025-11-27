import { styleParseError, StyleParseError } from './error';
import { findEndOfQuotedString, findEndOfURL } from './strings';
import {
	mergeTextTokens,
	textTokensToRule,
	textTokensToSelector,
} from './text';
import type { CSSToken, TextToken } from './types';

interface FindTokensResult {
	token: string;
	index: number;
}

/**
 * Find all tokens in css, sort by index
 */
function findTokens(code: string, tokens: string[]): FindTokensResult[] {
	const list: FindTokensResult[] = [];
	const lc = code.toLowerCase();

	tokens.forEach((token) => {
		let index = 0;
		while (true) {
			index = lc.indexOf(token, index);
			if (index === -1) {
				return;
			}
			list.push({
				token: token,
				index: index,
			});
			index++;
		}
	});

	list.sort((a, b) => a.index - b.index);
	return list;
}

/**
 * Get tokens
 */
export function getTokens(css: string): CSSToken[] | StyleParseError {
	const items: CSSToken[] = [];
	let textQueue: TextToken[] = [];

	let start = 0;
	let depth = 0;

	try {
		const checkRule = (text: string): void => {
			if (!textQueue.length) {
				return;
			}

			const item = textTokensToRule(textQueue);
			if (item) {
				items.push(item);
				return;
			}

			const value = mergeTextTokens(textQueue) + text;
			if (!value.length) {
				return;
			}

			throw styleParseError('Invalid css rule', css, textQueue[0]?.index);
		};

		findTokens(css, ['"', "'", '/*', '{', '}', ';', 'url(', '\\']).forEach(
			(token) => {
				if (token.index < start) {
					return;
				}

				switch (token.token) {
					case '/*': {
						// Skip to end of comment
						textQueue.push({
							type: 'chunk',
							text: css.slice(start, token.index),
							index: start,
						});
						start = token.index;

						const end = css.indexOf('*/', start + 2);
						if (end === -1) {
							// Invalid string
							throw styleParseError(
								'Missing comment closing statement',
								css,
								start
							);
						}

						start = end + 2;
						break;
					}

					case '\\':
						// Escaped character, skip next character
						textQueue.push({
							type: 'chunk',
							text: css.slice(start, token.index + 2),
							index: start,
						});
						start = token.index + 2;
						break;

					case 'url(': {
						textQueue.push({
							type: 'chunk',
							text: css.slice(start, token.index),
							index: start,
						});
						start = token.index;

						// Skip to end of URL
						const end = findEndOfURL(css, start);
						if (typeof end !== 'number') {
							throw end;
						}
						textQueue.push({
							type: 'url',
							text: css.slice(start, end),
							index: start,
						});
						start = end;
						break;
					}

					case '"':
					case "'": {
						textQueue.push({
							type: 'chunk',
							text: css.slice(start, token.index),
							index: start,
						});
						start = token.index;

						// Skip to end of quoted string
						const end = findEndOfQuotedString(
							css,
							token.token,
							start
						);
						if (end === null) {
							throw styleParseError(
								'Missing closing ' + token.token,
								css,
								start
							);
						}
						textQueue.push({
							type: 'quoted-string',
							text: css.slice(start, end),
							index: start,
						});
						start = end;
						break;
					}

					case ';': {
						textQueue.push({
							type: 'chunk',
							text: css.slice(start, token.index),
							index: start,
						});
						checkRule(token.token);
						start = token.index + 1;
						textQueue = [];
						break;
					}

					case '{': {
						// Get selector
						textQueue.push({
							type: 'chunk',
							text: css.slice(start, token.index),
							index: start,
						});

						const item = textTokensToSelector(textQueue);
						if (!item) {
							throw styleParseError(
								'Invalid css rule',
								css,
								start
							);
						}
						items.push(item);

						start = token.index + 1;
						textQueue = [];
						depth++;
						break;
					}

					case '}': {
						// End of block
						textQueue.push({
							type: 'chunk',
							text: css.slice(start, token.index),
							index: start,
						});
						checkRule('');

						items.push({
							type: 'close',
							index: token.index,
						});

						if (!depth) {
							throw styleParseError(
								'Unexpected }',
								css,
								token.index
							);
						}
						depth--;

						start = token.index + 1;
						textQueue = [];
						break;
					}

					default:
						throw new Error(
							`Forgot to parse token: ${token.token}`
						);
				}
			}
		);

		if (depth) {
			return styleParseError('Missing }', css);
		}

		// Add remaining code
		textQueue.push({
			type: 'chunk',
			text: css.slice(start),
			index: start,
		});
		checkRule('');
	} catch (err) {
		// Return error if it is StyleParseError object, re-throw if it is something else
		if (
			typeof err === 'object' &&
			(err as StyleParseError).type === 'style-parse-error'
		) {
			return err as StyleParseError;
		}
		throw err;
	}

	return items;
}

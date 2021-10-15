import { styleParseError, StyleParseError } from './error';

/**
 * Find end of quoted string
 *
 * Returns index of character after quote
 */
export function findEndOfQuotedString(
	code: string,
	quote: string,
	start: number
): number | null {
	let nextEscape = code.indexOf('\\', start + 1);
	let end = code.indexOf(quote, start + 1);

	if (end === -1) {
		// Invalid string
		return null;
	}

	while (nextEscape !== -1 && nextEscape < end) {
		if (end === nextEscape + 1) {
			end = code.indexOf(quote, end + 1);
			if (end === -1) {
				// Invalid string
				return null;
			}
		}
		nextEscape = code.indexOf('\\', nextEscape + 2);
	}

	return end + 1;
}

/**
 * Find end of url
 *
 * Returns index of character after end of URL
 */
export function findEndOfURL(
	code: string,
	start: number
): number | StyleParseError {
	let index = (start || 0) + 4;
	const length = code.length;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		if (index >= length) {
			return styleParseError('Cannot find end of URL', code, start);
		}
		let next = code.charAt(index);
		switch (next) {
			case '"':
			case "'": {
				// quoted url
				let end = findEndOfQuotedString(code, next, index);
				if (end === null) {
					return styleParseError('Incomplete string', code, index);
				}
				end = code.indexOf(')', end);
				return end === -1
					? styleParseError('Cannot find end of URL', code, start)
					: end + 1;
			}

			case ' ':
			case '\t':
			case '\r':
			case '\n':
				// skip whitespace
				index++;
				break;

			default:
				// unquoted url
				// eslint-disable-next-line no-constant-condition
				while (true) {
					switch (next) {
						case ')':
							return index + 1;

						case '"':
						case "'":
						case '(':
						case ' ':
						case '\t':
						case '\r':
						case '\n':
							return styleParseError('Invalid URL', code, start);

						default:
							if (code.charCodeAt(index) < 32) {
								return styleParseError(
									'Invalid URL',
									code,
									start
								);
							}
					}
					index++;
					if (index >= length) {
						return styleParseError(
							'Cannot find end of URL',
							code,
							start
						);
					}
					next = code.charAt(index);
				}
		}
	}
}

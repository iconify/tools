import type { ExtendedTagElement } from './types';

/**
 * Get tag for error message
 */
export function analyseTagError(element: ExtendedTagElement): string {
	let result = '<' + element.tagName;
	if (element._id) {
		result += ' id="' + element._id + '"';
	}
	const attribs = element.attribs;
	if (attribs['d']) {
		const value = attribs['d'];
		result +=
			' d="' +
			(value.length > 16 ? value.slice(0, 12) + '...' : value) +
			'"';
	}
	return result + '>';
}

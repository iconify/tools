import type { ExtendedTagElement } from './types';

/**
 * Get tag for error message
 */
export function analyseTagError(element: ExtendedTagElement): string {
	let result = '<' + element.tag;
	if (element._id) {
		result += ' id="' + element._id + '"';
	}
	const attribs = element.attribs;
	const value = attribs['d'];
	if (typeof value === 'string') {
		result +=
			' d="' +
			(value.length > 16 ? value.slice(0, 12) + '...' : value) +
			'"';
	}
	return result + '>';
}

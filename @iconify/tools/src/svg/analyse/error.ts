import type { ExtendedTagElement } from './types';

/**
 * Get tag for error message
 */
export function analyseTagError(element: ExtendedTagElement): string {
	return `<${element.tagName + (element._id ? ` id="${element._id}"` : '')}>`;
}

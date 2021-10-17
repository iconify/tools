import type { SVG } from '.';
import { removeBadAttributes } from './cleanup/attribs';
import { checkBadTags } from './cleanup/bad-tags';
import { expandInlineStyle } from './cleanup/inline-style';
import { cleanupSVGRoot } from './cleanup/root-svg';

/**
 * Clean up SVG
 */
export async function cleanupSVG(svg: SVG): Promise<void> {
	// Expand style
	await expandInlineStyle(svg);

	// Cleanup <svg> element
	await cleanupSVGRoot(svg);

	// Check for bad tags
	await checkBadTags(svg);

	// Remove attributes
	await removeBadAttributes(svg);
}

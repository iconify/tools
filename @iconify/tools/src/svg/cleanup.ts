import type { SVG } from '.';
import { removeBadAttributes } from './cleanup/attribs';
import { checkBadTags } from './cleanup/bad-tags';
import { cleanupInlineStyle } from './cleanup/inline-style';
import { cleanupSVGRoot } from './cleanup/root-svg';
import { convertStyleToAttrs } from './cleanup/svgo-style';

/**
 * Clean up SVG before parsing/optimising it
 */
export async function cleanupSVG(svg: SVG): Promise<void> {
	// Remove junk from style
	await cleanupInlineStyle(svg);

	// Expand style
	await convertStyleToAttrs(svg);

	// Cleanup <svg> element
	await cleanupSVGRoot(svg);

	// Check for bad tags
	await checkBadTags(svg);

	// Remove attributes
	await removeBadAttributes(svg);
}

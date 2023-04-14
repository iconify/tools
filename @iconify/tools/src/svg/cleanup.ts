import type { SVG } from '.';
import { removeBadAttributes } from './cleanup/attribs';
import { checkBadTags } from './cleanup/bad-tags';
import { cleanupInlineStyle } from './cleanup/inline-style';
import { cleanupRootStyle } from './cleanup/root-style';
import { cleanupSVGRoot } from './cleanup/root-svg';
import { convertStyleToAttrs } from './cleanup/svgo-style';

/**
 * Clean up SVG before parsing/optimising it
 */
export function cleanupSVG(svg: SVG): void {
	// Remove junk from style
	cleanupInlineStyle(svg);

	// Expand style
	convertStyleToAttrs(svg);

	// Cleanup <svg> element
	cleanupSVGRoot(svg);

	// Check for bad tags
	checkBadTags(svg);

	// Remove attributes
	removeBadAttributes(svg);

	// Clean up root style
	cleanupRootStyle(svg);
}

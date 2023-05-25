import type { SVG } from '.';
import { removeBadAttributes } from './cleanup/attribs';
import { CheckBadTagsOptions, checkBadTags } from './cleanup/bad-tags';
import { cleanupInlineStyle } from './cleanup/inline-style';
import { cleanupRootStyle } from './cleanup/root-style';
import { cleanupSVGRoot } from './cleanup/root-svg';
import { convertStyleToAttrs } from './cleanup/svgo-style';

/**
 * Options
 */
export type CleanupSVGOptions = CheckBadTagsOptions;

/**
 * Clean up SVG before parsing/optimising it
 */
export function cleanupSVG(svg: SVG, options?: CleanupSVGOptions): void {
	// Remove junk from style
	cleanupInlineStyle(svg);

	// Expand style
	convertStyleToAttrs(svg);

	// Cleanup <svg> element
	cleanupSVGRoot(svg);

	// Check for bad tags
	checkBadTags(svg, options);

	// Remove attributes
	removeBadAttributes(svg);

	// Clean up root style
	cleanupRootStyle(svg);
}

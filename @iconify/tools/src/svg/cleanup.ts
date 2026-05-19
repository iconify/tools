import type { SVG } from './index.js';
import { removeBadAttributes } from './cleanup/attribs.js';
import { CheckBadTagsOptions, checkBadTags } from './cleanup/bad-tags.js';
import { cleanupInlineStyle } from './cleanup/inline-style.js';
import { cleanupRootStyle } from './cleanup/root-style.js';
import { cleanupSVGRoot } from './cleanup/root-svg.js';
import { convertStyleToAttrs } from './cleanup/svgo-style.js';

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

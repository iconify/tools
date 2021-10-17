import type { SVG } from '..';
import { parseSVG } from '../parse';
import {
	allValidTags,
	animateMotionChildTags,
	animateTags,
	badTags,
	defsTag,
	feComponentTransferChildTag,
	feLightningChildTags,
	feLightningTags,
	feMergeChildTags,
	filterChildTags,
	filterTag,
	gradientChildTags,
	gradientTags,
	tagsBeforeAnimation,
	tagsInsideDefs,
	unsupportedTags,
} from '../data/tags';

// List of required parent tags
const requiredParentTags: Map<Set<string>, Set<string>> = new Map();

// <feFunc*> must be children of <feComponentTransfer>
requiredParentTags.set(
	new Set(['feComponentTransfer']),
	feComponentTransferChildTag
);

// <feMergeNode> must be children of <feMerge>
requiredParentTags.set(new Set(['feMerge']), feMergeChildTags);

// Children of <fe*Lightning>
requiredParentTags.set(feLightningTags, feLightningChildTags);

// Filter tags must be children of <filter>
requiredParentTags.set(filterTag, filterChildTags);

// Tags that must be inside <defs>: gradients, <pattern>, <marker>
requiredParentTags.set(defsTag, tagsInsideDefs);

// <stop> must be inside gradient
requiredParentTags.set(gradientTags, gradientChildTags);

// Animations must be inside shapes or filters
requiredParentTags.set(tagsBeforeAnimation, animateTags);

// <mpath> must be inside <animateMotion>
requiredParentTags.set(new Set(['animateMotion']), animateMotionChildTags);

/**
 * Test for bag tags
 */
export async function checkBadTags(svg: SVG): Promise<void> {
	await parseSVG(svg, (item) => {
		const tagName = item.tagName;
		const $element = item.$element;

		// SVG as root
		if (tagName === 'svg') {
			if (item.parents.length) {
				// Technically code is correct, but it badly complicates parsing, so not supported
				throw new Error(`Unexpected element: <${tagName}>`);
			}
			return;
		}

		// Unsupported: quietly remove it
		if (unsupportedTags.has(tagName)) {
			$element.remove();
			item.testChildren = false;
			return;
		}

		// Get parent tag
		const parentTagName = item.parents[0]?.tagName;

		// Bad or unknown
		if (badTags.has(tagName) || !allValidTags.has(tagName)) {
			throw new Error(`Unexpected element: <${tagName}>`);
		}

		// Check for valid parent tag
		for (const [parents, children] of requiredParentTags) {
			if (children.has(tagName)) {
				if (!parents.has(parentTagName)) {
					throw new Error(
						`Element <${tagName}> has wrong parent element`
					);
				}
				return;
			}
		}
	});
}

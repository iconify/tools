import type { SVG } from '..';
import { parseSVGStyleSync } from '../parse-style';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertNever(v: never) {
	//
}

interface CleanupRootStyleResult {
	animations?: Set<string>;
	removedAtRules?: Set<string>;
}

/**
 * Clean up root style
 *
 * This function removes all at-rule tokens, such as `@font-face`, `@media`
 */
export function cleanupRootStyle(svg: SVG): CleanupRootStyleResult {
	const result: CleanupRootStyleResult = {};

	parseSVGStyleSync(svg, (item) => {
		switch (item.type) {
			case 'inline':
				// Keep it
				return item.value;

			case 'global':
				// Keep it
				return item.value;

			case 'at-rule':
				// at-rule: remove it
				(
					result.removedAtRules || (result.removedAtRules = new Set())
				).add(item.prop);
				return;

			case 'keyframes':
				// Keep it
				(result.animations || (result.animations = new Set())).add(
					item.value
				);
				return item.value;

			default:
				assertNever(item);
		}
	});

	return result;
}

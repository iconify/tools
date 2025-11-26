import type { SVG } from '../svg';
import { runSVGO } from './svgo';

/**
 * Reset origin to 0 0
 */
export function resetSVGOrigin(svg: SVG) {
	const viewBox = svg.viewBox;
	const left = viewBox.left ?? 0;
	const top = viewBox.top ?? 0;
	if (left || top) {
		// Shift content
		const content = `<svg width="${viewBox.width}" height="${
			viewBox.height
		}" viewBox="0 0 ${viewBox.width} ${
			viewBox.height
		}"><g transform="translate(${0 - left} ${
			0 - top
		})">${svg.getBody()}</g></svg>`;
		svg.load(content);

		runSVGO(svg, {
			plugins: [
				'collapseGroups',
				'convertTransform',
				'convertPathData',
				'sortAttrs',
			],
		});
	}
}

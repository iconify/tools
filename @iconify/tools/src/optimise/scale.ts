import type { SVG } from '../svg';
import { resetSVGOrigin } from './origin';
import { runSVGO } from './svgo';

/**
 * Scale icon
 */
export function scaleSVG(svg: SVG, scale: number) {
	// Reset origin first
	resetSVGOrigin(svg);

	// Scale
	if (scale !== 1) {
		const viewBox = svg.viewBox;
		const width = viewBox.width * scale;
		const height = viewBox.height * scale;

		const content = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g transform="scale(${scale})">${svg.getBody()}</g></svg>`;
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

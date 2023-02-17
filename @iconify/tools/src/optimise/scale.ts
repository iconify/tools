import type { SVG } from '../svg';
import { runSVGO } from './svgo';

/**
 * Scale icon
 */
export function scaleSVG(svg: SVG, scale: number) {
	const viewBox = svg.viewBox;
	const width = viewBox.width * scale;
	const height = viewBox.height * scale;

	let shiftTransform = '';
	let shiftTransformEnd = '';
	if (viewBox.left !== 0 || viewBox.top !== 0) {
		// Shift content
		shiftTransform = `<g transform="translate(${0 - viewBox.left} ${
			0 - viewBox.top
		})">`;
		shiftTransformEnd = '</g>';
	}

	const content = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g transform="scale(${scale})">${shiftTransform}${svg.getBody()}${shiftTransformEnd}</g></svg>`;
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

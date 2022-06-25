import type { SVG } from '../svg';
import { runSVGO } from './svgo';

/**
 * Scale icon
 */
export function scaleSVG(svg: SVG, scale: number) {
	const viewBox = svg.viewBox;
	const width = viewBox.width * scale;
	const height = viewBox.height * scale;
	const left = viewBox.left * scale;
	const top = viewBox.top * scale;

	const content = `<svg width="${width}" height="${height}" viewBox="${left} ${top} ${width} ${height}"><g transform="scale(${scale})">${svg.getBody()}</g></svg>`;
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

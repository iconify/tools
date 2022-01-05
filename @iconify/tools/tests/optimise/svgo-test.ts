import { SVG } from '../../lib/svg';
import { runSVGO } from '../../lib/optimise/svgo';

describe('Optimising icon with animations', () => {
	test('Keeping shape', async () => {
		const svg = new SVG(
			'<svg width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" fill="#307594"><set attributeName="height" to="0" /><set attributeName="opacity" to="0" /><animate attributeName="height" values="0;16" dur="1s" fill="freeze" /><animate attributeName="opacity" values="0;1" dur="1.5s" fill="freeze" /></rect></svg>'
		);
		await runSVGO(svg);

		// <rect /> should not be changed to <path />
		expect(svg.toMinifiedString()).toBe(
			'<svg width="24" height="24" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" fill="#307594"><set attributeName="height" to="0"/><set attributeName="opacity" to="0"/><animate fill="freeze" attributeName="height" dur="1s" values="0;16"/><animate fill="freeze" attributeName="opacity" dur="1.5s" values="0;1"/></rect></svg>'
		);
	});

	test('Breaking animation (should fail when SVGO fixes bug)', async () => {
		const svg = new SVG(
			'<svg width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" fill="#307594"><set attributeName="height" to="0" /><set attributeName="opacity" to="0" /><animate attributeName="height" values="0;16" dur="1s" fill="freeze" /><animate attributeName="opacity" values="0;1" dur="1.5s" fill="freeze" /></rect></svg>'
		);
		await runSVGO(svg, {
			keepShapes: false,
		});

		// SVGO bug! https://github.com/svg/svgo/issues/1634
		expect(svg.toMinifiedString()).toBe(
			'<svg width="24" height="24" viewBox="0 0 24 24"><path fill="#307594" d="M2 4h20v16H2z"><set attributeName="height" to="0"/><set attributeName="opacity" to="0"/><animate fill="freeze" attributeName="height" dur="1s" values="0;16"/><animate fill="freeze" attributeName="opacity" dur="1.5s" values="0;1"/></path></svg>'
		);
	});
});

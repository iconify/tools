import { SVG } from '../../lib/svg';
import { runSVGO } from '../../lib/optimise/svgo';
import { loadFixture } from '../../lib/tests/load';

describe('Optimising icon with animations', () => {
	test('Keeping shape', () => {
		const svg = new SVG(
			'<svg width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" fill="#307594"><set attributeName="height" to="0" /><set attributeName="opacity" to="0" /><animate attributeName="height" values="0;16" dur="1s" fill="freeze" /><animate attributeName="opacity" values="0;1" dur="1.5s" fill="freeze" /></rect></svg>'
		);
		runSVGO(svg);

		// <rect /> should not be changed to <path />
		expect(svg.toMinifiedString()).toBe(
			'<svg width="24" height="24" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" fill="#307594"><set attributeName="height" to="0"/><set attributeName="opacity" to="0"/><animate fill="freeze" attributeName="height" dur="1s" values="0;16"/><animate fill="freeze" attributeName="opacity" dur="1.5s" values="0;1"/></rect></svg>'
		);
	});

	test('Breaking animation (should fail when SVGO fixes bug)', () => {
		const svg = new SVG(
			'<svg width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" fill="#307594"><set attributeName="height" to="0" /><set attributeName="opacity" to="0" /><animate attributeName="height" values="0;16" dur="1s" fill="freeze" /><animate attributeName="opacity" values="0;1" dur="1.5s" fill="freeze" /></rect></svg>'
		);
		runSVGO(svg, {
			keepShapes: false,
		});

		// SVGO bug! https://github.com/svg/svgo/issues/1634
		expect(svg.toMinifiedString()).not.toBe(
			'<svg width="24" height="24" viewBox="0 0 24 24"><path fill="#307594" d="M2 4h20v16H2z"><set attributeName="height" to="0"/><set attributeName="opacity" to="0"/><animate fill="freeze" attributeName="height" dur="1s" values="0;16"/><animate fill="freeze" attributeName="opacity" dur="1.5s" values="0;1"/></path></svg>'
		);
		expect(svg.toMinifiedString()).toBe(
			'<svg width="24" height="24" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" fill="#307594"><set attributeName="height" to="0"/><set attributeName="opacity" to="0"/><animate fill="freeze" attributeName="height" dur="1s" values="0;16"/><animate fill="freeze" attributeName="opacity" dur="1.5s" values="0;1"/></rect></svg>'
		);
	});

	test('Breaking removeOffCanvasPaths plugin', () => {
		const svg = new SVG(
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none"><path d="M12 12L19 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="il-md-length-15 il-md-duration-4 il-md-delay-0"/><path d="M12 12L5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="il-md-length-15 il-md-duration-4 il-md-delay-0"/><path d="M12 12L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="il-md-length-15 il-md-duration-4 il-md-delay-0"/><path d="M12 12L19 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="il-md-length-15 il-md-duration-4 il-md-delay-0"/></g></svg>'
		);
		runSVGO(svg, {
			keepShapes: false,
		});
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m12 12 7 7m-7-7L5 5m7 7-7 7m7-7 7-7" class="il-md-length-15 il-md-duration-4 il-md-delay-0"/></svg>'
		);
	});

	test('discord.svg', async () => {
		const content = (await loadFixture('discord.svg')).replace(
			/\s*\n\s*/g,
			''
		);
		const svg = new SVG(content);
		runSVGO(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="currentColor" fill-opacity="0"><circle cx="9" cy="12" r="1.5"><animate fill="freeze" attributeName="fill-opacity" begin="1.2s" dur="0.4s" values="0;1"/></circle><circle cx="15" cy="12" r="1.5"><animate fill="freeze" attributeName="fill-opacity" begin="1.4s" dur="0.4s" values="0;1"/></circle></g><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="30" stroke-dashoffset="30" d="M15.5 17.5L16.5 19.5C16.5 19.5 20.671 18.172 22 16C22 15 22.53 7.853 19 5.5C17.5 4.5 15 4 15 4L14 6H12M8.52799 17.5L7.52799 19.5C7.52799 19.5 3.35699 18.172 2.02799 16C2.02799 15 1.49799 7.853 5.02799 5.5C6.52799 4.5 9.02799 4 9.02799 4L10.028 6H12.028"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="30;60"/></path><path stroke-dasharray="16" stroke-dashoffset="16" d="M5.5 16C10.5 18.5 13.5 18.5 18.5 16"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.4s" values="16;0"/></path></g></svg>'
		);
	});

	test('Replacing IDs', () => {
		const svg = new SVG(
			'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><mask id="a"><g fill="none" stroke="#fff" stroke-width="4"><circle cx="24" cy="24" r="20" fill="#555"/><path stroke-linecap="round" stroke-linejoin="round" d="M32 16H16m8 18V16"/></g></mask><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#a)"/></svg>'
		);
		runSVGO(svg);

		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><mask id="svgID0"><g fill="none" stroke="#fff" stroke-width="4"><circle cx="24" cy="24" r="20" fill="#555"/><path stroke-linecap="round" stroke-linejoin="round" d="M32 16H16m8 18V16"/></g></mask><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#svgID0)"/></svg>'
		);
	});

	test('Replacing IDs with custom prefix', () => {
		const svg = new SVG(
			'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><mask id="a"><g fill="none" stroke="#fff" stroke-width="4"><circle cx="24" cy="24" r="20" fill="#555"/><path stroke-linecap="round" stroke-linejoin="round" d="M32 16H16m8 18V16"/></g></mask><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#a)"/></svg>'
		);
		runSVGO(svg, {
			cleanupIDs: 'test',
		});

		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><mask id="test0"><g fill="none" stroke="#fff" stroke-width="4"><circle cx="24" cy="24" r="20" fill="#555"/><path stroke-linecap="round" stroke-linejoin="round" d="M32 16H16m8 18V16"/></g></mask><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#test0)"/></svg>'
		);
	});
});

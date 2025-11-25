import { SVG } from '../../src/svg/index.js';
import { scaleSVG } from '../../src/optimise/scale.js';

describe('Scaling icon', () => {
	test('Scale by 20', () => {
		const svg = new SVG(
			'<svg viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg" width="1200" height="400"><path d="M300 200H150A150 150 0 10300 50z"/></svg>'
		);
		scaleSVG(svg, 1 / 20);
		expect(svg.toMinifiedString()).toBe(
			'<svg width="60" height="20" viewBox="0 0 60 20"><path d="M15 10H7.5A7.5 7.5 0 1 0 15 2.5z"/></svg>'
		);
	});

	test('Scale and shift', () => {
		const svg = new SVG(
			'<svg width="24" height="24" viewBox="0 96 960 960"><path d="M480 696h60v-90l70 90h73l-93-120 93-120h-73l-70 90v-90h-60v240Zm-140 0h60V456H280v60h60v180ZM200 936q-33 0-56.5-23.5T120 856V296q0-33 23.5-56.5T200 216h560q33 0 56.5 23.5T840 296v560q0 33-23.5 56.5T760 936H200Zm0-80h560V296H200v560Zm0-560v560-560Z"/></svg>'
		);
		expect(svg.viewBox).toEqual({
			left: 0,
			top: 96,
			width: 960,
			height: 960,
		});

		scaleSVG(svg, 1 / 40);
		expect(svg.toMinifiedString()).toBe(
			'<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 15h1.5v-2.25L15.25 15h1.825l-2.325-3 2.325-3H15.25l-1.75 2.25V9H12zm-3.5 0H10V9H7v1.5h1.5zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm0-2h14V5H5zM5 5v14z"/></svg>'
		);
		expect(svg.viewBox).toEqual({
			left: 0,
			top: 0,
			width: 24,
			height: 24,
		});
	});
});

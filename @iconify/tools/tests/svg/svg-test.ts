import { SVG } from '../../lib/svg';
import type { ViewBox } from '../../lib/svg';
import { loadFixture } from '../../lib/tests/load';

describe('Loading SVG', () => {
	test('Simple SVG', () => {
		const svg = new SVG(
			'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="-8 -16 24 40"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
		);
		const expected: ViewBox = {
			left: -8,
			top: -16,
			width: 24,
			height: 40,
		};
		expect(svg.viewBox).toEqual(expected);
		expect(svg.toString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="-8 -16 24 40"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
		);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="-8 -16 24 40"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
		);
		expect(svg.getBody()).toBe(
			'<path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/>'
		);

		// Customise before exporting

		// Default customisations: changes height to '1em'
		expect(svg.toMinifiedString({})).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="0.6em" height="1em" viewBox="-8 -16 24 40"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
		);

		// Keep original height
		expect(
			svg.toMinifiedString({
				height: 'auto',
			})
		).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="40" viewBox="-8 -16 24 40"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
		);

		// Transform and custom size. Transform also changes left/top coordinates to 0
		expect(
			svg.toMinifiedString({
				width: '1em',
				height: '1em',
				hFlip: true,
			})
		).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 40"><g transform="translate(16 16) scale(-1 1)"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></g></svg>'
		);
	});

	test('Removing Entypo junk', async () => {
		const svg = new SVG(await loadFixture('entypo-hair-cross.svg'));
		const expected: ViewBox = {
			left: 0,
			top: 0,
			width: 20,
			height: 20,
		};
		expect(svg.viewBox).toEqual(expected);
		expect(svg.toMinifiedString()).toBe(
			'<svg version="1.1" id="Hair_cross" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 20 20" style="enable-background:new 0 0 20 20;" width="20" height="20"><path d="M10,0.4c-5.303,0-9.601,4.298-9.601,9.6c0,5.303,4.298,9.601,9.601,9.601c5.301,0,9.6-4.298,9.6-9.601 C19.6,4.698,15.301,0.4,10,0.4z M11,17.525V13H9v4.525C5.604,17.079,2.92,14.396,2.473,11H7V9H2.473C2.92,5.604,5.604,2.921,9,2.475 V7h2V2.475c3.394,0.447,6.078,3.13,6.525,6.525H13v2h4.525C17.078,14.394,14.394,17.078,11,17.525z"/></svg>'
		);
	});

	test('Removing Adobe Illustrator junk', async () => {
		const svg = new SVG(await loadFixture('bpmn-trash.svg'));
		const expected: ViewBox = {
			left: 0,
			top: 0,
			width: 2048,
			height: 2048,
		};
		expect(svg.viewBox).toEqual(expected);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="2048" height="2048" id="svg3891" version="1.1" inkscape:version="0.91 r13725" sodipodi:docname="trash.svg" inkscape:export-filename="/home/nikku/camunda/projects/bpmn.io/bpmn-font/raw/trash.png" inkscape:export-xdpi="0.88" inkscape:export-ydpi="0.88" viewBox="0 0 2048 2048"><defs id="defs3893"><inkscape:path-effect effect="spiro" id="path-effect4094" is_visible="true"/><inkscape:path-effect effect="spiro" id="path-effect4094-0" is_visible="true"/></defs><sodipodi:namedview id="base" pagecolor="#ffffff" bordercolor="#666666" borderopacity="1.0" inkscape:pageopacity="0.0" inkscape:pageshadow="2" inkscape:zoom="0.175" inkscape:cx="307.67263" inkscape:cy="1030.7415" inkscape:document-units="px" inkscape:current-layer="layer1-6" showgrid="false" inkscape:window-width="1596" inkscape:window-height="807" inkscape:window-x="0" inkscape:window-y="91" inkscape:window-maximized="0" inkscape:snap-page="false" inkscape:snap-object-midpoints="false" inkscape:snap-nodes="false" inkscape:snap-to-guides="false" inkscape:snap-grids="false"/><metadata id="metadata3896"><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/><dc:title/></cc:Work></rdf:RDF></metadata><g inkscape:label="Layer 1" inkscape:groupmode="layer" id="layer1" transform="translate(0,995.63783)"><g transform="matrix(96.752895,0,0,96.752895,55.328158,-100816.34)" id="layer1-6" inkscape:label="Layer 1" style="display:inline"><path style="color:#000000;font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:medium;line-height:normal;font-family:sans-serif;text-indent:0;text-align:start;text-decoration:none;text-decoration-line:none;text-decoration-style:solid;text-decoration-color:#000000;letter-spacing:normal;word-spacing:normal;text-transform:none;direction:ltr;block-progression:tb;writing-mode:lr-tb;baseline-shift:baseline;text-anchor:start;white-space:normal;clip-rule:nonzero;display:inline;overflow:visible;visibility:visible;opacity:1;isolation:auto;mix-blend-mode:normal;color-interpolation:sRGB;color-interpolation-filters:linearRGB;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.343629;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;color-rendering:auto;image-rendering:auto;shape-rendering:auto;text-rendering:auto;enable-background:accumulate" d="m 3.4296875,1038.3672 1.3325877,12.7308 10.5912408,0 1.228186,-12.7284 -13.1520736,0 z m 1.4921875,1.3437 10.185547,0 -0.972656,10.0411 -8.1582035,0 z" id="rect4089" inkscape:connector-curvature="0" sodipodi:nodetypes="ccccccccccc"/><g id="g4275" transform="matrix(1,0,0,0.90111263,0,103.41515)"><path sodipodi:nodetypes="cc" inkscape:connector-curvature="0" inkscape:original-d="m 7.0333918,1040.9794 0.9432241,7.504" inkscape:path-effect="#path-effect4094" id="path4092" d="m 7.0333918,1040.9794 0.9432241,7.504" style="fill:none;stroke:#000000;stroke-width:1.343629;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"/><path sodipodi:nodetypes="cc" inkscape:connector-curvature="0" inkscape:original-d="m 12.990235,1040.9794 -0.943224,7.504" inkscape:path-effect="#path-effect4094-0" id="path4092-2" d="m 12.990235,1040.9794 -0.943224,7.504" style="fill:none;stroke:#000000;stroke-width:1.343629;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:4;stroke-opacity:1;stroke-dasharray:none"/></g><path style="fill:#000000;fill-opacity:1;stroke:none" d="m 7.2638322,1035.194 -4.2854023,1.2542 0,0.6276 14.0667651,0 0,-0.6276 -4.337726,-1.2542 z" id="rect4121" inkscape:connector-curvature="0" sodipodi:nodetypes="ccccccc"/><path style="display:inline;fill:#000000;fill-opacity:1;stroke:#000000;stroke-width:0.72291225;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1" d="m 7.6269598,1033.8929 4.7697062,0 0,1.737 -4.7697062,0 z" id="rect4121-6"/></g></g></svg>'
		);
	});

	test('Bug with minified code', async () => {
		const svg = new SVG(await loadFixture('noto-coin.svg'));
		const expectedContent = await loadFixture('noto-coin-minified.svg');
		const expected: ViewBox = {
			left: 0,
			top: 0,
			width: 128,
			height: 128,
		};
		expect(svg.viewBox).toEqual(expected);

		expect(svg.toMinifiedString()).toBe(expectedContent);
	});

	test('Missing dimensions', () => {
		expect(() => {
			new SVG(
				'<svg xmlns="http://www.w3.org/2000/svg"><path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/></svg>'
			);
		}).toThrowError();
	});

	test('Empty document', () => {
		expect(() => {
			new SVG('');
		}).toThrowError();
	});
});

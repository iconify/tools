import { blankIconSet } from '@iconify/tools/lib/icon-set';
import { SVG } from '@iconify/tools/lib/svg';

describe('Updating icons', () => {
	function minify(str) {
		return (
			str
				// Replace new line only after one of allowed characters that are not part of common attributes
				.replace(/(["';{}}><])\s*\n\s*/g, '$1')
				// Keep one space in case it is inside attribute
				.replace(/\s*\n\s*/g, ' ')
				.trim()
		);
	}

	it('Adding icons', () => {
		const lastModified = 123456;
		const exported = {
			prefix: 'test',
			lastModified,
			icons: {},
		};
		const list = [];
		const iconSet = blankIconSet('test');
		expect(iconSet.list()).toEqual(list);

		expect(iconSet.lastModified).toBeFalsy();
		iconSet.updateLastModified(lastModified);
		expect(iconSet.lastModified).toBe(lastModified);

		expect(iconSet.export()).toEqual(exported);

		// Add icon
		expect(
			iconSet.setIcon('foo', {
				body: '<g id="foo" />',
			})
		).toBe(true);

		expect(iconSet.lastModified).not.toBe(lastModified);
		iconSet.updateLastModified(lastModified);
		expect(iconSet.lastModified).toBe(lastModified);

		exported.icons.foo = {
			body: '<g id="foo" />',
		};
		list.push('foo');
		expect(iconSet.list()).toEqual(list);
		expect(iconSet.export()).toEqual(exported);

		// Add another icon
		expect(
			iconSet.setIcon('bar', {
				body: '<g id="bar" />',
				width: 24,
				height: 24,
			})
		).toBe(true);
		iconSet.updateLastModified(lastModified);
		exported.icons.bar = {
			body: '<g id="bar" />',
			width: 24,
			height: 24,
		};
		list.push('bar');
		expect(iconSet.list()).toEqual(list);
		expect(iconSet.export()).toEqual(exported);

		// Bad alias
		expect(iconSet.setAlias('foo-alias', 'no-parent')).toBe(false);
		expect(iconSet.lastModified).toBe(lastModified);
		expect(iconSet.list()).toEqual(list);
		expect(iconSet.export()).toEqual(exported);

		// Good alias
		expect(iconSet.setAlias('foo-alias', 'foo')).toBe(true);

		expect(iconSet.lastModified).not.toBe(lastModified);
		iconSet.updateLastModified(lastModified);
		expect(iconSet.lastModified).toBe(lastModified);

		exported.aliases = {
			'foo-alias': {
				parent: 'foo',
			},
		};
		expect(iconSet.list()).toEqual(list);
		expect(iconSet.export()).toEqual(exported);

		// Bad variation
		expect(
			iconSet.setVariation('foo-flip', 'no-parent', {
				hFlip: true,
			})
		).toBe(false);
		expect(iconSet.lastModified).toBe(lastModified);
		expect(iconSet.list()).toEqual(list);
		expect(iconSet.export()).toEqual(exported);

		// Good variation
		expect(
			iconSet.setVariation('foo-flip', 'foo', {
				hFlip: true,
			})
		).toBe(true);

		expect(iconSet.lastModified).not.toBe(lastModified);
		iconSet.updateLastModified(lastModified);
		expect(iconSet.lastModified).toBe(lastModified);

		exported.aliases['foo-flip'] = {
			parent: 'foo',
			hFlip: true,
		};
		list.push('foo-flip');
		expect(iconSet.list()).toEqual(list);
		expect(iconSet.export()).toEqual(exported);

		// Overwrite variation
		expect(
			iconSet.setVariation('foo-flip', 'foo', {
				vFlip: true,
			})
		).toBe(true);

		expect(iconSet.lastModified).not.toBe(lastModified);
		iconSet.updateLastModified(lastModified);
		expect(iconSet.lastModified).toBe(lastModified);

		exported.aliases['foo-flip'] = {
			parent: 'foo',
			vFlip: true,
		};
		expect(iconSet.list()).toEqual(list);
		expect(iconSet.export()).toEqual(exported);
	});

	it('Updating from SVG', () => {
		const lastModified = 123456;
		const exported = {
			prefix: 'test',
			icons: {},
		};
		const list = [];
		let svg;
		const iconSet = blankIconSet('test');
		expect(iconSet.list()).toEqual(list);
		expect(iconSet.export()).toEqual(exported);

		// Add icon
		const svgBody =
			'<path d="M3 0v1h4v5h-4v1h5v-7h-5zm1 2v1h-4v1h4v1l2-1.5-2-1.5z"/>';
		svg = new SVG(
			`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="-8 -16 24 40">${svgBody}</svg>`
		);
		expect(iconSet.fromSVG('foo', svg)).toBe(true);

		expect(iconSet.lastModified).toBeTruthy();
		iconSet.updateLastModified(lastModified);
		expect(iconSet.lastModified).toBe(lastModified);
		exported.lastModified = lastModified;

		exported.icons.foo = {
			body: svgBody,
			left: -8,
			top: -16,
			width: 24,
			height: 40,
		};
		list.push('foo');
		expect(iconSet.list()).toEqual(list);
		expect(iconSet.export()).toEqual(exported);

		// Get SVG
		svg = iconSet.toSVG('foo');
		expect(svg).not.toBeNull();
		expect(svg.viewBox).toEqual({
			left: -8,
			top: -16,
			width: 24,
			height: 40,
		});
		expect(svg.getBody()).toBe(svgBody);

		expect(iconSet.lastModified).toBe(lastModified);

		// Change viewBox, import as 'bar'
		svg.viewBox = {
			left: 0,
			top: 0,
			width: 32,
			height: 32,
		};
		iconSet.fromSVG('bar', svg);

		expect(iconSet.lastModified).not.toBe(lastModified);
		iconSet.updateLastModified(lastModified);
		expect(iconSet.lastModified).toBe(lastModified);

		exported.icons.bar = {
			body: svgBody,
			width: 32,
			height: 32,
		};
		list.push('bar');
		expect(iconSet.list()).toEqual(list);
		expect(iconSet.export()).toEqual(exported);

		// Change content, overwrite 'foo'
		const svgBody2 = `<g>
        <path d="M62.73,49.109c5.347-1.103,9.76-5.94,9.76-12.985c0-7.553-5.517-14.428-16.295-14.428H29.011
            c-1.438,0-2.604,1.166-2.604,2.604v51.399c0,1.438,1.166,2.604,2.604,2.604h28.118c10.863,0,16.464-6.79,16.464-15.361
            C73.594,55.899,68.841,50.042,62.73,49.109z M38.458,32.305h15.107c4.074,0,6.62,2.461,6.62,5.94c0,3.649-2.546,5.941-6.62,5.941
            H38.458V32.305z M54.073,67.695H38.458v-12.9h15.616c4.668,0,7.214,2.886,7.214,6.45C61.288,65.319,58.572,67.695,54.073,67.695z"
            />
    </g>`;
		svg.load(`<?xml version="1.0" encoding="utf-8"?>
        <!-- Generator: Adobe Illustrator 17.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
        <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
        ${svgBody2}
        </svg>
        `);
		expect(iconSet.lastModified).toBe(lastModified);
		expect(svg.viewBox).toEqual({
			left: 0,
			top: 0,
			width: 100,
			height: 100,
		});
		expect(svg.getBody()).toBe(minify(svgBody2));

		expect(iconSet.fromSVG('foo', svg)).toBe(true);

		expect(iconSet.lastModified).not.toBe(lastModified);
		iconSet.updateLastModified(lastModified);
		expect(iconSet.lastModified).toBe(lastModified);

		exported.icons.foo = {
			body: minify(svgBody2),
			width: 100,
			height: 100,
		};
		expect(iconSet.list()).toEqual(list);
		expect(iconSet.export()).toEqual(exported);
	});
});

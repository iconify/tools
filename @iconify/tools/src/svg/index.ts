import type { IconifyIcon } from '@iconify/types';
import { iconToSVG, prettifySVG, trimSVG } from '@iconify/utils';
import type { CommonIconProps } from '../icon-set/types';
import type { IconifyIconCustomisations } from '@iconify/utils/lib/customisations/defaults';
import {
	parseXMLContent,
	stringifyXMLContent,
	type ParsedXMLTagElement,
} from '@cyberalien/svg-utils';
import type { IconViewBox } from '@cyberalien/svg-utils/lib/svg/viewbox/types.js';
import { parseViewBox } from '@cyberalien/svg-utils/lib/svg/viewbox/parse.js';

type ViewBox = IconViewBox;

// Re-export types
export type { IconifyIconCustomisations, IconifyIcon, ViewBox };

/**
 * SVG class, used to manipulate icon content.
 */
export class SVG {
	// Root element, initialized in load()
	public $svg!: ParsedXMLTagElement;

	// Dimensions, initialized in load()
	public viewBox!: ViewBox;

	/**
	 * Constructor
	 */
	constructor(content: string) {
		this.load(content);
	}

	/**
	 * Get SVG as string
	 */
	toString(
		customisations?: IconifyIconCustomisations,
		prettyPrint = false
	): string {
		// Build icon if customisations are set
		if (customisations) {
			const data = iconToSVG(this.getIcon(), customisations);

			// Generate SVG
			let svgAttributes = ' xmlns="http://www.w3.org/2000/svg"';
			if (data.body.includes('xlink:')) {
				svgAttributes += ' xmlns:xlink="http://www.w3.org/1999/xlink"';
			}
			for (const key in data.attributes) {
				const value =
					data.attributes[key as keyof typeof data.attributes];
				svgAttributes += ' ' + key + '="' + value + '"';
			}

			const svg = '<svg' + svgAttributes + '>' + data.body + '</svg>';
			return prettyPrint === true
				? prettifySVG(svg) || svg
				: trimSVG(svg);
		}

		// Get icon as is if customisations are not set
		const $root = this.$svg;
		const attribs = $root.attribs;
		const box = this.viewBox;

		// Add missing viewBox attribute
		if (!attribs['viewBox']) {
			attribs['viewBox'] =
				`${box.left} ${box.top} ${box.width} ${box.height}`;
		}

		// Add missing width/height
		for (const prop of ['width', 'height'] as const) {
			if (!attribs[prop]) {
				attribs[prop] = box[prop];
			}
		}

		const result = stringifyXMLContent([$root], {
			prettyPrint,
		})!;

		// Additional trim for content (such as multi-line "d" attributes) because XML parser does not trim attributes
		return prettyPrint === false ? trimSVG(result) : result;
	}

	/**
	 * Get SVG as string without whitespaces
	 */
	toMinifiedString(customisations?: IconifyIconCustomisations): string {
		return this.toString(customisations, false);
	}

	/**
	 * Get SVG as string with whitespaces
	 */
	toPrettyString(customisations?: IconifyIconCustomisations): string {
		return this.toString(customisations, true);
	}

	/**
	 * Get body
	 */
	getBody(): string {
		// Make sure icon has no attributes on <svg> that affect content
		const $root = this.$svg;
		const attribs = $root.attribs;
		for (const key in attribs) {
			switch (key.split('-').shift()) {
				case 'fill':
				case 'stroke':
				case 'opacity':
					throw new Error(
						`Cannot use getBody() on icon that was not cleaned up with cleanupSVGRoot(). Icon has attribute ${key}="${attribs[key]}"`
					);
			}
		}

		return stringifyXMLContent($root.children)!;
	}

	/**
	 * Get icon as IconifyIcon
	 */
	getIcon(): IconifyIcon {
		const props: CommonIconProps = this.viewBox;
		const body = this.getBody();
		return {
			...props,
			body,
		};
	}

	/**
	 * Load SVG
	 *
	 * @param {string} content
	 */
	load(content: string): void {
		// Remove junk
		function remove(str1: string, str2: string, append: string) {
			let start = 0;

			while ((start = content.indexOf(str1, start)) !== -1) {
				const end = content.indexOf(str2, start + str1.length);
				if (end === -1) {
					return;
				}
				content =
					content.slice(0, start) +
					append +
					content.slice(end + str2.length);
				start = start + append.length;
			}
		}

		// Remove comments
		remove('<!--', '-->', '');

		// Remove doctype and XML declaration
		remove('<?xml', '?>', '');
		remove('<!DOCTYPE svg', '<svg', '<svg');

		// Remove Adobe Illustrator junk
		remove(
			'xmlns:x="&ns_extend;" xmlns:i="&ns_ai;" xmlns:graph="&ns_graphs;"',
			'',
			''
		);
		remove('xml:space="preserve"', '', '');

		// Remove empty <g> elements
		content = content.replace(/<g>\s*<\/g>/g, '');

		// Load content
		const root = parseXMLContent(content);
		if (!root || root.length !== 1) {
			throw new Error('Invalid SVG file');
		}
		const rootTag = root[0];
		if (rootTag.type !== 'tag' || rootTag.tag !== 'svg') {
			throw new Error('Invalid SVG file: missing <svg> root element');
		}
		this.$svg = rootTag;

		// Get dimensions and origin
		const attribs = rootTag.attribs;
		const viewBox = attribs['viewBox'];
		if (typeof viewBox === 'string') {
			const parsed = parseViewBox(viewBox);
			if (!parsed) {
				throw new Error('Invalid SVG file: bad viewBox attribute');
			}
			this.viewBox = parsed;
		} else {
			const width = attribs['width'];
			const height = attribs['height'];
			if (!width || !height) {
				throw new Error('Invalid SVG file: missing dimensions');
			}
			const parsed = parseViewBox(`0 0 ${width} ${height}`);
			if (!parsed) {
				throw new Error(
					'Invalid SVG file: bad size attributes and no viewBox'
				);
			}
			this.viewBox = parsed;
		}
	}
}

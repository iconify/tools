import cheerio from 'cheerio';
import type { IconifyIcon } from '@iconify/types';
import { trimSVG, iconToSVG } from '@iconify/utils';
import type { CommonIconProps } from '../icon-set/types';
import type { IconifyIconCustomisations } from '@iconify/utils/lib/customisations/defaults';
import type { CheerioElement } from '../misc/cheerio';

export interface ViewBox {
	left: number;
	top: number;
	width: number;
	height: number;
}

// Re-export types
export type { IconifyIconCustomisations, IconifyIcon };

/**
 * SVG class, used to manipulate icon content.
 */
export class SVG {
	// Cheerio tree, initialized in load()
	public $svg!: cheerio.Root;

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
	toString(customisations?: IconifyIconCustomisations): string {
		// Build icon if customisations are set
		if (customisations) {
			const data = iconToSVG(this.getIcon(), customisations);

			// Generate SVG
			let svgAttributes = ' xmlns="http://www.w3.org/2000/svg"';
			if (data.body.indexOf('xlink:') !== -1) {
				svgAttributes += ' xmlns:xlink="http://www.w3.org/1999/xlink"';
			}
			for (const key in data.attributes) {
				const value =
					data.attributes[key as keyof typeof data.attributes];
				svgAttributes += ' ' + key + '="' + value + '"';
			}

			return '<svg' + svgAttributes + '>' + data.body + '</svg>';
		}

		// Get icon as is if customisations are not set
		const $root = this.$svg(':root');
		const box = this.viewBox;

		// Add missing viewBox attribute
		if ($root.attr('viewBox') === void 0) {
			$root.attr(
				'viewBox',
				`${box.left} ${box.top} ${box.width} ${box.height}`
			);
		}

		// Add missing width/height
		if ($root.attr('width') === void 0) {
			$root.attr('width', box.width.toString());
		}
		if ($root.attr('height') === void 0) {
			$root.attr('height', box.height.toString());
		}

		return this.$svg.html();
	}

	/**
	 * Get SVG as string without whitespaces
	 */
	toMinifiedString(customisations?: IconifyIconCustomisations): string {
		return trimSVG(this.toString(customisations));
	}

	/**
	 * Get body
	 */
	getBody(): string {
		// Make sure icon has no attributes on <svg> that affect content
		const $root = this.$svg(':root');
		const attribs = ($root.get(0) as CheerioElement).attribs;
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

		return trimSVG(this.$svg('svg').html() as string);
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
		this.$svg = cheerio.load(content.trim(), {
			lowerCaseAttributeNames: false,
			xmlMode: true,
		});

		// Check root
		const $root = this.$svg(':root');
		if (
			$root.length > 1 ||
			($root.get(0) as CheerioElement).tagName !== 'svg'
		) {
			throw new Error('Invalid SVG file: bad root tag');
		}

		// Get dimensions and origin
		const viewBox = $root.attr('viewBox');
		if (viewBox !== void 0) {
			const list = viewBox.split(' ');

			this.viewBox = {
				left: parseFloat(list[0]),
				top: parseFloat(list[1]),
				width: parseFloat(list[2]),
				height: parseFloat(list[3]),
			};
		} else {
			const width = $root.attr('width');
			const height = $root.attr('height');
			if (!width || !height) {
				throw new Error('Invalid SVG file: missing dimensions');
			}
			this.viewBox = {
				left: 0,
				top: 0,
				width: parseFloat(width),
				height: parseFloat(height),
			};
		}

		Object.keys(this.viewBox).forEach((key) => {
			const attr = key as keyof ViewBox;
			if (isNaN(this.viewBox[attr])) {
				throw new Error(`Invalid SVG file: invalid ${attr}`);
			}
		});
	}
}

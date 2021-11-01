import cheerio from 'cheerio';

export interface ViewBox {
	left: number;
	top: number;
	width: number;
	height: number;
}

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
	toString(): string {
		const $root = this.$svg(':root');
		const box = this.viewBox;

		// Add missing viewBox attribute
		if ($root.attr('viewBox') === void 0) {
			$root.attr(
				'viewBox',
				box.left + ' ' + box.top + ' ' + box.width + ' ' + box.height
			);
		}

		// Add missing width/height
		if ($root.attr('width') === void 0) {
			$root.attr('width', box.width + '');
		}
		if ($root.attr('height') === void 0) {
			$root.attr('height', box.height + '');
		}

		return this.$svg.html();
	}

	/**
	 * Get SVG as string without whitespaces
	 */
	toMinifiedString(): string {
		return this.toString().replace(/\s*\n\s*/g, '');
	}

	/**
	 * Get body
	 */
	getBody(): string {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.$svg('svg')
			.html()!
			.replace(/\s*\n\s*/g, '');
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
		if ($root.length > 1 || $root.get(0).tagName !== 'svg') {
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

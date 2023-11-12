import { SVG, convertSVGToMask } from '@iconify/tools';

const svg = new SVG(
	`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
	<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="4">
		<path fill="#2F88FF" stroke="#000" d="M44.0001 24C44.0001 35.0457 35.0458 44 24.0001 44C18.0266 44 4.00006 44 4.00006 44C4.00006 44 4.00006 29.0722 4.00006 24C4.00006 12.9543 12.9544 4 24.0001 4C35.0458 4 44.0001 12.9543 44.0001 24Z"/>
		<path stroke="#fff" d="M14 18L32 18"/>
		<path stroke="#fff" d="M14 26H32"/>
		<path stroke="#fff" d="M14 34H24"/>
	</g>
</svg>`
);

// Convert to mask
convertSVGToMask(svg, {
	// Treat black as solid
	solid: '#000',
	// No transparent colors
	transparent: [],
	// Custom opacity for other colors
	custom: (color) => {
		switch (color) {
			case '#fff':
				return 0.75; // same as returning '#bfbfbf'

			case '#2f88ff':
				return 0.25; // same as returning '#404040'
		}
	},
});

// Output result
console.log(svg.toString());

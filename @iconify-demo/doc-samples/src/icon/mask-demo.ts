import { SVG, convertSVGToMask } from '@iconify/tools';

const svg = new SVG(
	`<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.5 20C4.98 20 3.68333 19.4767 2.61 18.43C1.53667 17.3767 1 16.0933 1 14.58C1 13.28 1.39 12.12 2.17 11.1C2.95667 10.08 3.98333 9.43 5.25 9.15C5.67 7.61667 6.50333 6.37667 7.75 5.43C9.00333 4.47667 10.42 4 12 4C13.9533 4 15.6067 4.68 16.96 6.04C18.32 7.39333 19 9.04667 19 11C20.1533 11.1333 21.1067 11.6333 21.86 12.5C22.62 13.3533 23 14.3533 23 15.5C23 16.7533 22.5633 17.8167 21.69 18.69C20.8167 19.5633 19.7533 20 18.5 20" fill="white"/>
        <path d="M6.5 18H18.5C19.2 18 19.79 17.7567 20.27 17.27C20.7567 16.79 21 16.2 21 15.5C21 14.8 20.7567 14.21 20.27 13.73C19.79 13.2433 19.2 13 18.5 13H17V11C17 9.62 16.5133 8.44 15.54 7.46C14.5667 6.48667 13.3867 6 12 6C10.62 6 9.44 6.48667 8.46 7.46C7.48667 8.44 7 9.62 7 11H6.5C5.53333 11 4.71 11.3433 4.03 12.03C3.34333 12.71 3 13.5333 3 14.5C3 15.4667 3.34333 16.3 4.03 17C4.71 17.6667 5.53333 18 6.5 18Z" fill="#444"/>
        <circle cx="19" cy="19" r="5" fill="red"/>
        <path d="M18 16H20V18H22V20H20V22H18V20H16V18H18V16Z" fill="white"/>
    </svg>`
);

// Convert to mask without changing any colors, use them as an alpha channel
convertSVGToMask(svg, {
	// Set rectangle color to currentColor
	color: 'currentColor',
	// Do not specify solid and transparent colors (resets default values)
	solid: [],
	transparent: [],
	// Use custom option instead of options above, returning color as is
	custom: (color) => color,
});

// Output result
console.log(svg.toString());

import { SVG, scaleSVG, runSVGO } from '@iconify/tools';

(async () => {
	const svg = new SVG(
		'<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 2048 2048"><path d="m387.19 644.317 128.875 1231.76h1024.807l118.813-1231.47H387.19zm144.356 130.035h985.428l-94.044 971.496H633.62z" color="#000"/><path fill="none" stroke="#000" stroke-linecap="round" stroke-width="1.344" d="m7.033 1040.98.944 7.503m5.013-7.503-.943 7.503" transform="matrix(96.7529 0 0 87.185 55.328 -89815)"/><path d="M758.141 337.32 343.458 458.648v60.76h1361.023v-60.76L1284.767 337.32z"/><path stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="69.952" d="M793.262 211.444h461.512v168.06H793.262z"/></svg>'
	);

	// Reduce size by 64 to get 32x32 icon
	await scaleSVG(svg, 1 / 64);

	// Optimize icon
	await runSVGO(svg);

	// Output result
	console.log(svg.toString());
})();

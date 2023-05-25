import { SVG, deOptimisePaths } from '@iconify/tools';

(async () => {
	const svg = new SVG(
		'<svg viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg" width="1200" height="400"><path d="M300 200H150A150 150 0 10300 50z"/></svg>'
	);

	// Update path
	await deOptimisePaths(svg);

	console.log(svg.toMinifiedString());
})();

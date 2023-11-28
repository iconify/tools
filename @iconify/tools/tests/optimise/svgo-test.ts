import { SVG } from '../../lib/svg';
import { runSVGO } from '../../lib/optimise/svgo';
import { loadFixture } from '../../lib/tests/helpers';
import { analyseSVGStructure } from '../../lib/svg/analyse';

describe('Optimising icon with animations', () => {
	test('Keeping shape', () => {
		const svg = new SVG(
			'<svg width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" fill="#307594"><set attributeName="height" to="0" /><set attributeName="opacity" to="0" /><animate attributeName="height" values="0;16" dur="1s" fill="freeze" /><animate attributeName="opacity" values="0;1" dur="1.5s" fill="freeze" /></rect></svg>'
		);
		runSVGO(svg);

		// <rect /> should not be changed to <path />
		expect(svg.toMinifiedString()).toBe(
			'<svg width="24" height="24" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" fill="#307594"><set attributeName="height" to="0"/><set attributeName="opacity" to="0"/><animate fill="freeze" attributeName="height" dur="1s" values="0;16"/><animate fill="freeze" attributeName="opacity" dur="1.5s" values="0;1"/></rect></svg>'
		);
	});

	test('Breaking animation (should fail when SVGO fixes bug)', () => {
		const svg = new SVG(
			'<svg width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" fill="#307594"><set attributeName="height" to="0" /><set attributeName="opacity" to="0" /><animate attributeName="height" values="0;16" dur="1s" fill="freeze" /><animate attributeName="opacity" values="0;1" dur="1.5s" fill="freeze" /></rect></svg>'
		);
		runSVGO(svg, {
			keepShapes: false,
		});

		// SVGO bug! https://github.com/svg/svgo/issues/1634
		expect(svg.toMinifiedString()).not.toBe(
			'<svg width="24" height="24" viewBox="0 0 24 24"><path fill="#307594" d="M2 4h20v16H2z"><set attributeName="height" to="0"/><set attributeName="opacity" to="0"/><animate fill="freeze" attributeName="height" dur="1s" values="0;16"/><animate fill="freeze" attributeName="opacity" dur="1.5s" values="0;1"/></path></svg>'
		);
		expect(svg.toMinifiedString()).toBe(
			'<svg width="24" height="24" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" fill="#307594"><set attributeName="height" to="0"/><set attributeName="opacity" to="0"/><animate fill="freeze" attributeName="height" dur="1s" values="0;16"/><animate fill="freeze" attributeName="opacity" dur="1.5s" values="0;1"/></rect></svg>'
		);
	});

	test('Breaking removeOffCanvasPaths plugin', () => {
		const svg = new SVG(
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="none"><path d="M12 12L19 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="il-md-length-15 il-md-duration-4 il-md-delay-0"/><path d="M12 12L5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="il-md-length-15 il-md-duration-4 il-md-delay-0"/><path d="M12 12L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="il-md-length-15 il-md-duration-4 il-md-delay-0"/><path d="M12 12L19 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="il-md-length-15 il-md-duration-4 il-md-delay-0"/></g></svg>'
		);
		runSVGO(svg, {
			keepShapes: false,
		});
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m12 12 7 7m-7-7L5 5m7 7-7 7m7-7 7-7" class="il-md-length-15 il-md-duration-4 il-md-delay-0"/></svg>'
		);
	});

	test('discord.svg', async () => {
		const content = (await loadFixture('discord.svg')).replace(
			/\s*\n\s*/g,
			''
		);
		const svg = new SVG(content);
		runSVGO(svg);
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="currentColor" fill-opacity="0"><circle cx="9" cy="12" r="1.5"><animate fill="freeze" attributeName="fill-opacity" begin="1.2s" dur="0.4s" values="0;1"/></circle><circle cx="15" cy="12" r="1.5"><animate fill="freeze" attributeName="fill-opacity" begin="1.4s" dur="0.4s" values="0;1"/></circle></g><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="30" stroke-dashoffset="30" d="M15.5 17.5L16.5 19.5C16.5 19.5 20.671 18.172 22 16C22 15 22.53 7.853 19 5.5C17.5 4.5 15 4 15 4L14 6H12M8.52799 17.5L7.52799 19.5C7.52799 19.5 3.35699 18.172 2.02799 16C2.02799 15 1.49799 7.853 5.02799 5.5C6.52799 4.5 9.02799 4 9.02799 4L10.028 6H12.028"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="30;60"/></path><path stroke-dasharray="16" stroke-dashoffset="16" d="M5.5 16C10.5 18.5 13.5 18.5 18.5 16"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.4s" values="16;0"/></path></g></svg>'
		);
	});

	test('Replacing IDs', () => {
		const svg = new SVG(
			'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><mask id="a"><g fill="none" stroke="#fff" stroke-width="4"><circle cx="24" cy="24" r="20" fill="#555"/><path stroke-linecap="round" stroke-linejoin="round" d="M32 16H16m8 18V16"/></g></mask><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#a)"/></svg>'
		);
		runSVGO(svg);

		// Make sure all IDs are correct
		analyseSVGStructure(svg);

		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><mask id="svgID0"><g fill="none" stroke="#fff" stroke-width="4"><circle cx="24" cy="24" r="20" fill="#555"/><path stroke-linecap="round" stroke-linejoin="round" d="M32 16H16m8 18V16"/></g></mask><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#svgID0)"/></svg>'
		);
	});

	test('Replacing IDs with custom prefix', () => {
		const svg = new SVG(
			'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32"><defs><path id="svgIDi" d="M10.11 8.939a1.375 1.375 0 0 1 1.282.856l4.636 11.372a1.375 1.375 0 1 1-2.547 1.038l-.674-1.654a.1.1 0 0 0-.093-.063H7.647a.1.1 0 0 0-.093.064l-.648 1.639a1.375 1.375 0 1 1-2.557-1.01l4.49-11.372c.207-.523.71-.867 1.272-.87Zm-1.39 8.663a.1.1 0 0 0 .093.136h2.7a.1.1 0 0 0 .092-.137l-1.371-3.364a.1.1 0 0 0-.186 0L8.72 17.603Zm9.799-8.507c-.758 0-1.374.614-1.375 1.372l-.025 11.078a1.375 1.375 0 0 0 1.375 1.378h5.069c.034 0 .067-.001.1-.003c2.268-.03 4.133-1.853 4.133-4.144a4.116 4.116 0 0 0-1.703-3.335a.104.104 0 0 1-.028-.136c.353-.606.556-1.31.556-2.066c0-2.31-1.896-4.144-4.188-4.144h-3.914Zm3.893 8.287h1.196c.815 0 1.438.645 1.438 1.394c0 .75-.623 1.394-1.438 1.394c-.032 0-.064 0-.096.003h-3.54a.1.1 0 0 1-.1-.1l.006-2.59a.1.1 0 0 1 .1-.1h2.434Zm.042-2.75h-2.47a.1.1 0 0 1-.1-.1l.006-2.587a.1.1 0 0 1 .1-.1h2.443c.815 0 1.438.645 1.438 1.394c0 .742-.612 1.382-1.417 1.393Z"/></defs><g fill="none"><g filter="url(#svgIDa)"><rect width="27.875" height="27.875" x="2.09" y="2.063" fill="url(#svgIDb)" rx="3.6"/><rect width="27.875" height="27.875" x="2.09" y="2.063" fill="url(#svgIDc)" rx="3.6"/></g><g filter="url(#svgIDd)"><path stroke="url(#svgIDe)" stroke-linecap="round" stroke-width="1.5" d="M28.278 4.563v22.875"/></g><g filter="url(#svgIDf)"><path stroke="url(#svgIDg)" stroke-linecap="round" stroke-width="1.5" d="M5.554 3.875h21.781"/></g><g fill="#EF2B54" filter="url(#svgIDh)"><use href="#svgIDi"/></g><g fill="#FCF2FF" filter="url(#svgIDj)"><use href="#svgIDi"/></g><defs><filter id="svgIDa" width="28.875" height="28.875" x="2.09" y="1.063" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dx="1" dy="-1"/><feGaussianBlur stdDeviation="1.5"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 0.901961 0 0 0 0 0.133333 0 0 0 0 0.337255 0 0 0 1 0"/><feBlend in2="shape" result="effect1_innerShadow_18590_2298"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="-1"/><feGaussianBlur stdDeviation="1.5"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 0.85098 0 0 0 0 0.168627 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="effect1_innerShadow_18590_2298" result="effect2_innerShadow_18590_2298"/></filter><filter id="svgIDd" width="5.5" height="28.375" x="25.528" y="1.813" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_18590_2298" stdDeviation="1"/></filter><filter id="svgIDf" width="27.281" height="5.5" x="2.804" y="1.125" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_18590_2298" stdDeviation="1"/></filter><filter id="svgIDh" width="25.544" height="16.123" x="3.252" y="7.939" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_18590_2298" stdDeviation=".5"/></filter><filter id="svgIDj" width="24.344" height="14.923" x="3.852" y="8.539" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dx="-.4" dy=".4"/><feGaussianBlur stdDeviation=".375"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 0.913725 0 0 0 0 0.886275 0 0 0 0 0.968627 0 0 0 1 0"/><feBlend in2="shape" result="effect1_innerShadow_18590_2298"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dx=".4" dy="-.4"/><feGaussianBlur stdDeviation=".2"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 0.988235 0 0 0 0 1 0 0 0 1 0"/><feBlend in2="effect1_innerShadow_18590_2298" result="effect2_innerShadow_18590_2298"/></filter><linearGradient id="svgIDb" x1="16.028" x2="16.028" y1="5.637" y2="38.89" gradientUnits="userSpaceOnUse"><stop stop-color="#FF4D91"/><stop offset="1" stop-color="#F34A5F"/></linearGradient><linearGradient id="svgIDe" x1="28.778" x2="28.778" y1="4.563" y2="27.438" gradientUnits="userSpaceOnUse"><stop stop-color="#FF66A5"/><stop offset="1" stop-color="#FF5B6B"/></linearGradient><linearGradient id="svgIDg" x1="28.492" x2="2.96" y1="4.125" y2="4.125" gradientUnits="userSpaceOnUse"><stop stop-color="#FF60A3"/><stop offset="1" stop-color="#FF5495"/></linearGradient><radialGradient id="svgIDc" cx="0" cy="0" r="1" gradientTransform="matrix(-1.56249 1.46876 -1.71548 -1.82495 27.747 4.156)" gradientUnits="userSpaceOnUse"><stop stop-color="#FF77B1"/><stop offset="1" stop-color="#FF77B1" stop-opacity="0"/></radialGradient></defs></g></svg>'
		);
		runSVGO(svg, {
			cleanupIDs: 'test',
		});

		// Make sure all IDs are correct
		analyseSVGStructure(svg);

		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><defs><path id="test0" d="M10.11 8.939a1.375 1.375 0 011.282.856l4.636 11.372a1.375 1.375 0 11-2.547 1.038l-.674-1.654a.1.1 0 00-.093-.063H7.647a.1.1 0 00-.093.064l-.648 1.639a1.375 1.375 0 11-2.557-1.01l4.49-11.372c.207-.523.71-.867 1.272-.87Zm-1.39 8.663a.1.1 0 00.093.136h2.7a.1.1 0 00.092-.137l-1.371-3.364a.1.1 0 00-.186 0L8.72 17.603Zm9.799-8.507c-.758 0-1.374.614-1.375 1.372l-.025 11.078a1.375 1.375 0 001.375 1.378h5.069c.034 0 .067-.001.1-.003 2.268-.03 4.133-1.853 4.133-4.144a4.116 4.116 0 00-1.703-3.335.104.104 0 01-.028-.136c.353-.606.556-1.31.556-2.066 0-2.31-1.896-4.144-4.188-4.144h-3.914Zm3.893 8.287h1.196c.815 0 1.438.645 1.438 1.394 0 .75-.623 1.394-1.438 1.394-.032 0-.064 0-.096.003h-3.54a.1.1 0 01-.1-.1l.006-2.59a.1.1 0 01.1-.1h2.434Zm.042-2.75h-2.47a.1.1 0 01-.1-.1l.006-2.587a.1.1 0 01.1-.1h2.443c.815 0 1.438.645 1.438 1.394 0 .742-.612 1.382-1.417 1.393Z"/></defs><g fill="none"><g filter="url(#test1)"><rect width="27.875" height="27.875" x="2.09" y="2.063" fill="url(#test6)" rx="3.6"/><rect width="27.875" height="27.875" x="2.09" y="2.063" fill="url(#test9)" rx="3.6"/></g><g filter="url(#test2)"><path stroke="url(#test7)" stroke-linecap="round" stroke-width="1.5" d="M28.278 4.563v22.875"/></g><g filter="url(#test3)"><path stroke="url(#test8)" stroke-linecap="round" stroke-width="1.5" d="M5.554 3.875h21.781"/></g><g fill="#EF2B54" filter="url(#test4)"><use href="#test0"/></g><g fill="#FCF2FF" filter="url(#test5)"><use href="#test0"/></g><defs><filter id="test1" width="28.875" height="28.875" x="2.09" y="1.063" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dx="1" dy="-1"/><feGaussianBlur stdDeviation="1.5"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 0.901961 0 0 0 0 0.133333 0 0 0 0 0.337255 0 0 0 1 0"/><feBlend in2="shape" result="effect1_innerShadow_18590_2298"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="-1"/><feGaussianBlur stdDeviation="1.5"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 0.85098 0 0 0 0 0.168627 0 0 0 0 0.231373 0 0 0 1 0"/><feBlend in2="effect1_innerShadow_18590_2298" result="effect2_innerShadow_18590_2298"/></filter><filter id="test2" width="5.5" height="28.375" x="25.528" y="1.813" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_18590_2298" stdDeviation="1"/></filter><filter id="test3" width="27.281" height="5.5" x="2.804" y="1.125" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_18590_2298" stdDeviation="1"/></filter><filter id="test4" width="25.544" height="16.123" x="3.252" y="7.939" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur result="effect1_foregroundBlur_18590_2298" stdDeviation=".5"/></filter><filter id="test5" width="24.344" height="14.923" x="3.852" y="8.539" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dx="-.4" dy=".4"/><feGaussianBlur stdDeviation=".375"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 0.913725 0 0 0 0 0.886275 0 0 0 0 0.968627 0 0 0 1 0"/><feBlend in2="shape" result="effect1_innerShadow_18590_2298"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dx=".4" dy="-.4"/><feGaussianBlur stdDeviation=".2"/><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 0.988235 0 0 0 0 1 0 0 0 1 0"/><feBlend in2="effect1_innerShadow_18590_2298" result="effect2_innerShadow_18590_2298"/></filter><linearGradient id="test6" x1="16.028" x2="16.028" y1="5.637" y2="38.89" gradientUnits="userSpaceOnUse"><stop stop-color="#FF4D91"/><stop offset="1" stop-color="#F34A5F"/></linearGradient><linearGradient id="test7" x1="28.778" x2="28.778" y1="4.563" y2="27.438" gradientUnits="userSpaceOnUse"><stop stop-color="#FF66A5"/><stop offset="1" stop-color="#FF5B6B"/></linearGradient><linearGradient id="test8" x1="28.492" x2="2.96" y1="4.125" y2="4.125" gradientUnits="userSpaceOnUse"><stop stop-color="#FF60A3"/><stop offset="1" stop-color="#FF5495"/></linearGradient><radialGradient id="test9" cx="0" cy="0" r="1" gradientTransform="matrix(-1.56249 1.46876 -1.71548 -1.82495 27.747 4.156)" gradientUnits="userSpaceOnUse"><stop stop-color="#FF77B1"/><stop offset="1" stop-color="#FF77B1" stop-opacity="0"/></radialGradient></defs></g></svg>'
		);
	});

	test('Reusable elements and mask', () => {
		const svg = new SVG(
			'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><mask id="mask"><g fill="none"><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M44 44L4 4V44H44Z"/><path fill="#555" fill-rule="evenodd" d="M13 35H25L13 23V35Z" clip-rule="evenodd"/><path fill="#555" fill-rule="evenodd" d="M13 35H25L13 23V35Z" clip-rule="evenodd"/><path fill="#555" fill-rule="evenodd" d="M13 35H25L13 23V35Z" clip-rule="evenodd"/><path fill="#555" fill-rule="evenodd" d="M13 35H25L13 23V35Z" clip-rule="evenodd"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M13 35H25L13 23V35Z" clip-rule="evenodd"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M13 35H25L13 23V35Z" clip-rule="evenodd"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M13 35H25L13 23V35Z" clip-rule="evenodd"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M13 35H25L13 23V35Z" clip-rule="evenodd"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M30 44V41"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M24 44V41"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M18 44V41"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M12 44V41"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M4 36H7"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M4 30H7"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M4 24H7"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M4 18H7"/></g></mask><rect mask="url(#mask)" x="0" y="0" width="48" height="48" fill="#000"/></svg>'
		);
		runSVGO(svg);

		// Should replace duplicate elements with <use />, cleanup should fix xlink namespace
		expect(svg.toMinifiedString()).toBe(
			'<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><defs><path id="svgID0" fill="#555" d="M13 35h12L13 23v12Z"/><path id="svgID1" stroke="#fff" d="M13 35h12L13 23v12Z"/></defs><mask id="svgID2"><g fill="none"><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M44 44 4 4v40h40Z"/><use href="#svgID0" fill-rule="evenodd" clip-rule="evenodd"/><use href="#svgID0" fill-rule="evenodd" clip-rule="evenodd"/><use href="#svgID0" fill-rule="evenodd" clip-rule="evenodd"/><use href="#svgID0" fill-rule="evenodd" clip-rule="evenodd"/><use href="#svgID1" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" clip-rule="evenodd"/><use href="#svgID1" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" clip-rule="evenodd"/><use href="#svgID1" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" clip-rule="evenodd"/><use href="#svgID1" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" clip-rule="evenodd"/><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M30 44v-3m-6 3v-3m-6 3v-3m-6 3v-3m-8-5h3m-3-6h3m-3-6h3m-3-6h3"/></g></mask><path d="M0 0h48v48H0z" mask="url(#svgID2)"/></svg>'
		);
	});

	test('IDs in animated icon', () => {
		const svg = new SVG(
			'<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,21L15.6,16.2C14.6,15.45 13.35,15 12,15C10.65,15 9.4,15.45 8.4,16.2L12,21" opacity="0"><animate id="spinner_jbAr" begin="0;spinner_8ff3.end+0.2s" attributeName="opacity" calcMode="discrete" dur="0.25s" values="0;1" fill="freeze"/><animate id="spinner_8ff3" begin="spinner_aTlH.end+0.5s" attributeName="opacity" dur="0.001s" values="1;0" fill="freeze"/></path><path d="M12,9C9.3,9 6.81,9.89 4.8,11.4L6.6,13.8C8.1,12.67 9.97,12 12,12C14.03,12 15.9,12.67 17.4,13.8L19.2,11.4C17.19,9.89 14.7,9 12,9Z" opacity="0"><animate id="spinner_dof4" begin="spinner_jbAr.end" attributeName="opacity" calcMode="discrete" dur="0.25s" values="0;1" fill="freeze"/><animate begin="spinner_aTlH.end+0.5s" attributeName="opacity" dur="0.001s" values="1;0" fill="freeze"/></path><path d="M12,3C7.95,3 4.21,4.34 1.2,6.6L3,9C5.5,7.12 8.62,6 12,6C15.38,6 18.5,7.12 21,9L22.8,6.6C19.79,4.34 16.05,3 12,3" opacity="0"><animate id="spinner_aTlH" begin="spinner_dof4.end" attributeName="opacity" calcMode="discrete" dur="0.25s" values="0;1" fill="freeze"/><animate begin="spinner_aTlH.end+0.5s" attributeName="opacity" dur="0.001s" values="1;0" fill="freeze"/></path></svg>'
		);
		runSVGO(svg, {
			keepShapes: true,
		});

		// Should replace all IDs
		const code = svg.toMinifiedString();
		expect(code.indexOf('spinner_')).toBe(-1);
	});

	test('Filter with transform', () => {
		const svg = new SVG(
			'<svg width="320" height="320" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#filter1_i_18_3767)"><rect x="19.087" y="12.7969" width="14" height="6" rx="3" transform="rotate(31.3889 19.087 12.7969)" fill="#DE773D"/><rect x="19.087" y="12.7969" width="14" height="6" rx="3" transform="rotate(31.3889 19.087 12.7969)" fill="url(#paint8_radial_18_3767)"/><rect x="19.087" y="12.7969" width="14" height="6" rx="3" transform="rotate(31.3889 19.087 12.7969)" fill="url(#paint9_linear_18_3767)"/><rect x="19.087" y="12.7969" width="14" height="6" rx="3" transform="rotate(31.3889 19.087 12.7969)" fill="url(#paint10_radial_18_3767)"/><rect x="19.087" y="12.7969" width="14" height="6" rx="3" transform="rotate(31.3889 19.087 12.7969)" fill="url(#paint11_radial_18_3767)"/></g><defs><filter id="filter1_i_18_3767" x="17.085" y="13.7699" width="12.9801" height="10.3176" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dx="0.15" dy="-0.15"/><feGaussianBlur stdDeviation="0.5"/><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 0.580392 0 0 0 0 0.25098 0 0 0 0 0.309804 0 0 0 1 0"/><feBlend mode="normal" in2="shape" result="effect1_innerShadow_18_3767"/></filter><radialGradient id="paint8_radial_18_3767" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(28.5912 19.9011) rotate(-84.3783) scale(5.08751 7.13795)"><stop offset="0.175294" stop-color="#983C50"/><stop offset="1" stop-color="#983C50" stop-opacity="0"/></radialGradient><linearGradient id="paint9_linear_18_3767" x1="26.0987" y1="12.6361" x2="25.9033" y2="14.4759" gradientUnits="userSpaceOnUse"><stop stop-color="#EB9251"/><stop offset="1" stop-color="#EB9251" stop-opacity="0"/></linearGradient><radialGradient id="paint10_radial_18_3767" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(31.5998 13.6726) rotate(95.481) scale(2.5 1.64694)"><stop stop-color="#FFB075"/><stop offset="1" stop-color="#FFB075" stop-opacity="0"/></radialGradient><radialGradient id="paint11_radial_18_3767" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(23.9116 17.6313) rotate(-45.9881) scale(3.47146 4.6882)"><stop offset="0.845647" stop-color="#FFAA6F"/><stop offset="1" stop-color="#FFAA6F" stop-opacity="0"/></radialGradient></defs></svg>'
		);
		runSVGO(svg, {
			keepShapes: true,
		});

		// Should not include group with both transform and filter
		const code = svg.toMinifiedString();
		const groupStart = code.indexOf('<g ');
		const groupEnd = code.indexOf('>', groupStart);
		const group = code.slice(groupStart, groupEnd);
		expect(group.includes('filter=')).toBe(true);
		expect(group.includes('transform=')).toBe(false);
	});

	test('Icon with title', () => {
		const svg = new SVG(
			'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><title>Test</title><path d="M0 0V24H24V0z" /></svg>'
		);
		runSVGO(svg);

		const code = svg.toMinifiedString();
		expect(code.includes('<title>Test</title>')).toBe(true);
	});
});

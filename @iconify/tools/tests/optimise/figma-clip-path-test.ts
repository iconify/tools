import { SVG } from '../../src/svg/index.js';
import { removeFigmaClipPathFromSVG } from '../../src/optimise/figma.js';

describe('Cleaning up Figma clip paths', () => {
	test('Basic icon', () => {
		const paths = `<path d="M19 13.5V18.6518C19 18.8671 18.8846 19.0659 18.6977 19.1728L12.2977 22.8299C12.1132 22.9353 11.8868 22.9353 11.7023 22.8299L5.30233 19.1728C5.11539 19.0659 5.00001 18.8671 5.00001 18.6518L5 13" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>`;
		const svg = new SVG(
			`<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_3377_18972)">
        ${paths}
    </g>
    <defs>
        <clipPath id="clip0_3377_18972">
            <rect width="24" height="24" fill="white"/>
        </clipPath>
    </defs>
</svg>`
		);
		removeFigmaClipPathFromSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			`<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g>${paths}</g></svg>`
		);
	});

	test('Paths without group', () => {
		const svg = new SVG(
			`<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="#292929" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#clip0_3377_18972)" />
    <rect x="12.01" y="12" width="0.01" height="0.01" transform="rotate(90 12.01 12)" stroke="#292929" stroke-width="1.5" stroke-linejoin="round" clip-path="url(#clip0_3377_18972)"/>
    <defs>
        <clipPath id="clip0_3377_18972">
            <rect width="24" height="24" fill="white"/>
        </clipPath>
    </defs>
</svg>`
		);
		removeFigmaClipPathFromSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			`<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#292929" stroke-linecap="round" stroke-linejoin="round"/><rect x="12.01" y="12" width="0.01" height="0.01" transform="rotate(90 12.01 12)" stroke="#292929" stroke-width="1.5" stroke-linejoin="round"/></svg>`
		);
	});

	test('Attributes', () => {
		const svg = new SVG(
			`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_3377_18972)">
        <path d="M0 0z" stroke="currentColor" />
    </g>
    <defs>
        <clipPath id="clip0_3377_18972">
            <rect width="24" height="24" fill="#fff" stroke-width="1.5" transform="translate(0 0.000976562)"/>
        </clipPath>
    </defs>
</svg>`
		);
		removeFigmaClipPathFromSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke-width="1.5"><path d="M0 0z" stroke="currentColor"/></g></svg>`
		);
	});

	test('Penpot export with double clip path bug', () => {
		const svg = new SVG(
			`<svg xmlns:xlink="http://www.w3.org/1999/xlink" width="12" xmlns="http://www.w3.org/2000/svg" height="12" id="screenshot-baf79b5d-6e18-809d-8003-dfd1a1d08748" viewBox="0 0 12 12" style="-webkit-print-color-adjust: exact;" fill="none" version="1.1">
	<g id="shape-baf79b5d-6e18-809d-8003-dfd1a1d08748">
		<defs>
			<clipPath class="frame-clip-def frame-clip" id="frame-clip-baf79b5d-6e18-809d-8003-dfd1a1d08748-rumext-id-1">
				<rect rx="0" ry="0" x="0" y="0" width="12" height="12" transform="" />
			</clipPath>
		</defs>
		<g clip-path="url(#frame-clip-baf79b5d-6e18-809d-8003-dfd1a1d08748-rumext-id-1)">
			<clipPath class="frame-clip-def frame-clip" id="frame-clip-baf79b5d-6e18-809d-8003-dfd1a1d08748-rumext-id-1">
				<rect rx="0" ry="0" x="0" y="0" width="12" height="12" transform="" />
			</clipPath>
			<g class="fills" id="fills-baf79b5d-6e18-809d-8003-dfd1a1d08748">
				<rect rx="0" ry="0" x="0" y="0" transform="" width="12" height="12" class="frame-background" />
			</g>
			<g class="frame-children">
				<g id="shape-baf79b5d-6e18-809d-8003-dfceca1d6601">
					<g class="fills" id="fills-baf79b5d-6e18-809d-8003-dfceca1d6601">
						<path rx="0" ry="0" d="M6.000,5.293L10.789,0.503L11.496,1.211L6.706,6.001L11.496,10.790L10.789,11.497L5.999,6.707L1.210,11.497L0.503,10.790L5.293,6.000L0.502,1.211L1.210,0.504L6.000,5.293ZL6.000,5.293ZZ" style="fill: rgb(0, 0, 0);" />
					</g>
				</g>
			</g>
		</g>
	</g>
</svg>`
		);
		removeFigmaClipPathFromSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			`<svg width="12" xmlns="http://www.w3.org/2000/svg" height="12" viewBox="0 0 12 12" fill="none"><g><g><rect width="12" height="12"/></g><g><g><g><path d="M6.000,5.293L10.789,0.503L11.496,1.211L6.706,6.001L11.496,10.790L10.789,11.497L5.999,6.707L1.210,11.497L0.503,10.790L5.293,6.000L0.502,1.211L1.210,0.504L6.000,5.293ZL6.000,5.293ZZ" fill="#000"/></g></g></g></g></svg>`
		);
	});

	test('Penpot export with transformation matrix', () => {
		const svg =
			new SVG(`<svg xmlns:xlink="http://www.w3.org/1999/xlink" width="24" xmlns="http://www.w3.org/2000/svg" height="24" id="screenshot-775c72fc-4c66-80f9-8003-e040725f2984" viewBox="0 0 24 24" style="-webkit-print-color-adjust: exact;" fill="none" version="1.1">
		<g id="shape-775c72fc-4c66-80f9-8003-e040725f2984">
		 <defs>
		  <clipPath class="frame-clip-def frame-clip" id="frame-clip-775c72fc-4c66-80f9-8003-e040725f2984-rumext-id-1">
		   <rect rx="0" ry="0" x="0" y="0" width="24" height="24" transform="" style="fill: rgb(255, 255, 255); fill-opacity: 1;" />
		  </clipPath>
		 </defs>
		 <g clip-path="url(#frame-clip-775c72fc-4c66-80f9-8003-e040725f2984-rumext-id-1)" fill="none">
		  <clipPath class="frame-clip-def frame-clip" id="frame-clip-775c72fc-4c66-80f9-8003-e040725f2984-rumext-id-1">
		   <rect rx="0" ry="0" x="0" y="0" width="24" height="24" transform="" style="fill: rgb(255, 255, 255); fill-opacity: 1;" />
		  </clipPath>
		  <g class="fills" id="fills-775c72fc-4c66-80f9-8003-e040725f2984">
		   <rect width="24" height="24" class="frame-background" x="0" transform="" style="fill: rgb(255, 255, 255); fill-opacity: 1;" ry="0" rx="0" y="0" />
		  </g>
		  <g class="frame-children">
		   <g id="shape-775c72fc-4c66-80f9-8003-e04068de381e">
			<g class="fills" id="fills-775c72fc-4c66-80f9-8003-e04068de381e">
			 <ellipse rx="12" ry="12" cx="12" cy="12" transform="matrix(1.000000, 0.000000, 0.000000, 1.000000, 0.000000, 0.000000)" style="fill: rgb(177, 178, 181); fill-opacity: 1;" />
			</g>
		   </g>
		  </g>
		 </g>
		</g>
	   </svg>`);
		removeFigmaClipPathFromSVG(svg);
		expect(svg.toMinifiedString()).toBe(
			`<svg width="24" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" fill="none"><g fill="none"><g><rect width="24" height="24" fill="#fff"/></g><g><g><g><ellipse rx="12" ry="12" cx="12" cy="12" fill="#b1b2b5"/></g></g></g></g></svg>`
		);
	});
});

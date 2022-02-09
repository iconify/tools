/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { SVG } from '../../lib/svg';
import { analyseSVGStructure } from '../../lib/svg/analyse';
import type {
	AnalyseSVGStructureResult,
	LinkToElementWithID,
	ElementsTreeItem,
} from '../../lib/svg/analyse/types';

/**
 * Generate data to test `ids` property
 */
interface MappedIDs {
	tagName: string;
	usedAsMask: boolean;
	usedAsPaint: boolean;
}
function mapIDsToTags(
	data: AnalyseSVGStructureResult
): Record<string, MappedIDs> {
	const result: Record<string, MappedIDs> = Object.create(null);
	for (const id in data.ids) {
		const index = data.ids[id];
		const element = data.elements.get(index)!;
		const item: MappedIDs = {
			tagName: element.tagName,
			usedAsMask: element._usedAsMask,
			usedAsPaint: element._usedAsPaint,
		};
		result[id] = item;
	}
	return result;
}

/**
 * Generate data to test `uses` property
 */
interface MappedUses extends Omit<LinkToElementWithID, 'usedByIndex'> {
	usedByTagName: string;
}
function mapUses(data: AnalyseSVGStructureResult): MappedUses[] {
	const { links, elements } = data;
	return links.map((item) => {
		const { usedByIndex, ...other } = item;
		return {
			...other,
			usedByTagName: elements.get(usedByIndex)!.tagName,
		};
	});
}

/**
 * Generate data to test `elements` property
 */
interface MappedElements {
	tagName: string;
	parentTagName?: string;
	childTagNames?: string[];
	id?: string;
	reusableID?: string;
	ids?: string[];
	usedAsMask?: boolean;
	usedAsPaint?: boolean;
}
function mapElements(data: AnalyseSVGStructureResult): MappedElements[] {
	const results: MappedElements[] = [];
	const elements = data.elements;
	elements.forEach((item) => {
		const {
			tagName,
			_id,
			_usedAsMask,
			_usedAsPaint,
			_reusableElement,
			_belongsTo,
			_parentElement,
			_childElements,
		} = item;
		const result: MappedElements = {
			tagName,
		};
		if (_parentElement !== void 0) {
			result.parentTagName = elements.get(_parentElement)!.tagName;
		}
		if (_childElements) {
			result.childTagNames = _childElements.map(
				(index) => elements.get(index)!.tagName
			);
		}
		if (typeof _id === 'string') {
			result.id = _id;
		}
		if (_reusableElement) {
			result.reusableID = _reusableElement.id;
		}
		if (_belongsTo) {
			result.ids = _belongsTo.map((item) => item.id);
		}
		if (_usedAsMask !== void 0) {
			result.usedAsMask = _usedAsMask;
		}
		if (_usedAsPaint !== void 0) {
			result.usedAsPaint = _usedAsPaint;
		}
		results.push(result);
	});
	return results;
}

/**
 * Map tree
 */
interface MappedElementsTreeItem {
	tagName: string;
	usedAsMask: boolean;
	parentTagName?: string;
	children: MappedElementsTreeItem[];
}

function mapTree(data: AnalyseSVGStructureResult): MappedElementsTreeItem {
	const { tree, elements } = data;

	function map(tree: ElementsTreeItem): MappedElementsTreeItem {
		const element = elements.get(tree.index)!;
		const item: MappedElementsTreeItem = {
			tagName: element.tagName,
			usedAsMask: tree.usedAsMask,
			children: tree.children.map(map),
		};
		if (tree.parent) {
			const parentIndex = tree.parent.index;
			const parentElement = elements.get(parentIndex)!;
			item.parentTagName = parentElement.tagName;
		}
		return item;
	}
	return map(tree);
}

describe('Analysing SVG structure', () => {
	test('Mask that uses path', async () => {
		const svgCode = `<svg width="256px" height="256px" viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
			<defs>
				<path d="M2.27464661e-14,0 L254.693878,3.04336596e-14 L254.693878,160.344259 C255.3267,161.198982 255.762422,162.157626 256,163.39634 L256,168.36419 C255.762422,169.608049 255.3267,170.691008 254.693878,171.604678 L254.693878,256 L0,256 L0,192 L0,64 L2.27464661e-14,0 Z" id="path-1"></path>
				<radialGradient cx="16.6089694%" cy="17.3718345%" fx="16.6089694%" fy="17.3718345%" r="118.520308%" id="radialGradient-3">
					<stop stop-color="#88CDE7" offset="0%"></stop>
					<stop id="test2" stop-color="#2274AD" offset="100%"></stop>
				</radialGradient>
			</defs>
			<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
				<mask id="mask-2" fill="white">
					<use href="#path-1"></use>
				</mask>
				<polygon id="test" fill="url(#radialGradient-3)" mask="url(#mask-2)" points="0 256 256 256 256 0 0 0"></polygon>
			</g>
		</svg>`;
		const svg = new SVG(svgCode);

		// Analyse stuff
		const result = await analyseSVGStructure(svg);

		// Make sure IDs belong to correct tags
		const tagsWithID = mapIDsToTags(result);
		expect(tagsWithID).toEqual({
			'path-1': {
				tagName: 'path',
				usedAsMask: true,
				usedAsPaint: false,
			},
			'radialGradient-3': {
				tagName: 'radialGradient',
				usedAsMask: false,
				usedAsPaint: true,
			},
			'mask-2': {
				tagName: 'mask',
				usedAsMask: true,
				usedAsPaint: false,
			},
			'test': {
				tagName: 'polygon',
				usedAsMask: false,
				usedAsPaint: true,
			},
			'test2': {
				tagName: 'stop',
				usedAsMask: false,
				usedAsPaint: true,
			},
		});

		const mappedUses = mapUses(result);
		expect(mappedUses).toEqual([
			{
				id: 'path-1',
				usedByTagName: 'use',
				usedAsMask: false,
			},
			{
				id: 'radialGradient-3',
				usedByTagName: 'polygon',
				usedAsMask: false,
			},
			{
				id: 'mask-2',
				usedByTagName: 'polygon',
				usedAsMask: true,
			},
		]);

		const mappedElements = mapElements(result);
		expect(mappedElements).toEqual([
			{
				tagName: 'svg',
				childTagNames: ['g'],
				usedAsMask: false,
				usedAsPaint: true,
			},
			{
				tagName: 'defs',
				usedAsMask: false,
				usedAsPaint: false,
			},
			{
				tagName: 'path',
				id: 'path-1',
				reusableID: 'path-1',
				ids: ['path-1'],
				usedAsMask: true,
				usedAsPaint: false,
			},
			{
				tagName: 'radialGradient',
				childTagNames: ['stop', 'stop'],
				id: 'radialGradient-3',
				reusableID: 'radialGradient-3',
				ids: ['radialGradient-3'],
				usedAsMask: false,
				usedAsPaint: true,
			},
			{
				tagName: 'stop',
				parentTagName: 'radialGradient',
				reusableID: 'radialGradient-3',
				ids: ['radialGradient-3'],
				usedAsMask: false,
				usedAsPaint: true,
			},
			{
				tagName: 'stop',
				parentTagName: 'radialGradient',
				id: 'test2',
				reusableID: 'radialGradient-3',
				ids: ['radialGradient-3', 'test2'],
				usedAsMask: false,
				usedAsPaint: true,
			},
			{
				tagName: 'g',
				parentTagName: 'svg',
				childTagNames: ['polygon'],
				usedAsMask: false,
				usedAsPaint: true,
			},
			{
				tagName: 'mask',
				childTagNames: ['use'],
				id: 'mask-2',
				reusableID: 'mask-2',
				ids: ['mask-2'],
				usedAsMask: true,
				usedAsPaint: false,
			},
			{
				tagName: 'use',
				parentTagName: 'mask',
				reusableID: 'mask-2',
				ids: ['mask-2'],
				usedAsMask: true,
				usedAsPaint: false,
			},
			{
				tagName: 'polygon',
				parentTagName: 'g',
				id: 'test',
				ids: ['test'],
				usedAsMask: false,
				usedAsPaint: true,
			},
		]);

		// Test tree
		const mappedTree = mapTree(result);
		expect(mappedTree).toEqual({
			tagName: 'svg',
			usedAsMask: false,
			children: [
				{
					tagName: 'g',
					usedAsMask: false,
					children: [
						{
							tagName: 'polygon',
							usedAsMask: false,
							children: [
								{
									tagName: 'radialGradient',
									usedAsMask: false,
									children: [
										{
											tagName: 'stop',
											usedAsMask: false,
											children: [],
											parentTagName: 'radialGradient',
										},
										{
											tagName: 'stop',
											usedAsMask: false,
											children: [],
											parentTagName: 'radialGradient',
										},
									],
									parentTagName: 'polygon',
								},
								{
									tagName: 'mask',
									usedAsMask: true,
									children: [
										{
											tagName: 'use',
											usedAsMask: false,
											children: [
												{
													tagName: 'path',
													usedAsMask: false,
													children: [],
													parentTagName: 'use',
												},
											],
											parentTagName: 'mask',
										},
									],
									parentTagName: 'polygon',
								},
							],
							parentTagName: 'g',
						},
					],
					parentTagName: 'svg',
				},
			],
		});
	});

	test('Several references to same element', async () => {
		const svgCode = `<svg width="256" height="256" viewBox="0 0 256 256">
			<defs>
				<symbol id="def1" fill="purple">
					<rect x="0" y="0" width="64" height="64" id="def2" />
				</symbol>
			</defs>
			<use href="#def1" fill="red" />
			<use href="#def2" transform="translate(32 32)" />
			<use href="#def2" fill="teal" transform="translate(64 64)" />
		</svg>`;
		const svg = new SVG(svgCode);

		// Analyse stuff
		const result = await analyseSVGStructure(svg);

		// Make sure IDs belong to correct tags
		const tagsWithID = mapIDsToTags(result);
		expect(tagsWithID).toEqual({
			def1: {
				tagName: 'symbol',
				usedAsMask: false,
				usedAsPaint: true,
			},
			def2: {
				tagName: 'rect',
				usedAsMask: false,
				usedAsPaint: true,
			},
		});

		const mappedUses = mapUses(result);
		expect(mappedUses).toEqual([
			{
				id: 'def1',
				usedAsMask: false,
				usedByTagName: 'use',
			},
			{
				id: 'def2',
				usedAsMask: false,
				usedByTagName: 'use',
			},
			{
				id: 'def2',
				usedAsMask: false,
				usedByTagName: 'use',
			},
		]);

		const mappedElements = mapElements(result);
		expect(mappedElements).toEqual([
			{
				tagName: 'svg',
				childTagNames: ['use', 'use', 'use'],
				usedAsMask: false,
				usedAsPaint: true,
			},
			{
				tagName: 'defs',
				usedAsMask: false,
				usedAsPaint: false,
			},
			{
				tagName: 'symbol',
				childTagNames: ['rect'],
				id: 'def1',
				reusableID: 'def1',
				ids: ['def1'],
				usedAsMask: false,
				usedAsPaint: true,
			},
			{
				tagName: 'rect',
				parentTagName: 'symbol',
				id: 'def2',
				reusableID: 'def1',
				ids: ['def1', 'def2'],
				usedAsMask: false,
				usedAsPaint: true,
			},
			{
				tagName: 'use',
				parentTagName: 'svg',
				usedAsMask: false,
				usedAsPaint: true,
			},
			{
				tagName: 'use',
				parentTagName: 'svg',
				usedAsMask: false,
				usedAsPaint: true,
			},
			{
				tagName: 'use',
				parentTagName: 'svg',
				usedAsMask: false,
				usedAsPaint: true,
			},
		]);

		// Test tree
		const mappedTree = mapTree(result);
		expect(mappedTree).toEqual({
			tagName: 'svg',
			usedAsMask: false,
			children: [
				{
					tagName: 'use',
					usedAsMask: false,
					children: [
						{
							tagName: 'symbol',
							usedAsMask: false,
							children: [
								{
									tagName: 'rect',
									usedAsMask: false,
									children: [],
									parentTagName: 'symbol',
								},
							],
							parentTagName: 'use',
						},
					],
					parentTagName: 'svg',
				},
				{
					tagName: 'use',
					usedAsMask: false,
					children: [
						{
							tagName: 'rect',
							usedAsMask: false,
							children: [],
							parentTagName: 'use',
						},
					],
					parentTagName: 'svg',
				},
				{
					tagName: 'use',
					usedAsMask: false,
					children: [
						{
							tagName: 'rect',
							usedAsMask: false,
							children: [],
							parentTagName: 'use',
						},
					],
					parentTagName: 'svg',
				},
			],
		});
	});

	test('Missing definition', async () => {
		const svgCode = `<svg width="256px" height="256px" viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
			<defs>
				<radialGradient cx="16.6089694%" cy="17.3718345%" fx="16.6089694%" fy="17.3718345%" r="118.520308%" id="radialGradient-3">
					<stop stop-color="#88CDE7" offset="0%"></stop>
					<stop id="test2" stop-color="#2274AD" offset="100%"></stop>
				</radialGradient>
			</defs>
			<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
				<mask id="mask-2" fill="white">
					<use href="#path-1"></use>
				</mask>
				<polygon id="test" fill="url(#radialGradient-3)" mask="url(#mask-2)" points="0 256 256 256 256 0 0 0"></polygon>
			</g>
		</svg>`;
		const svg = new SVG(svgCode);

		// Analyse stuff
		try {
			await analyseSVGStructure(svg);
			throw new Error('Expected to throw');
		} catch (err) {
			expect(err instanceof Error).toBe(true);
			expect((err as Error).message).toBe(
				'Missing element with id="path-1"'
			);
		}
	});

	test('Recursion', async () => {
		const svgCode = `<svg width="256px" height="256px" viewBox="0 0 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
			<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
				<mask id="mask-2" fill="white">
					<use href="#test"></use>
				</mask>
				<polygon id="test" mask="url(#mask-2)" points="0 256 256 256 256 0 0 0"></polygon>
			</g>
		</svg>`;
		const svg = new SVG(svgCode);

		// Analyse stuff
		try {
			await analyseSVGStructure(svg);
			throw new Error('Expected to throw');
		} catch (err) {
			expect(err instanceof Error).toBe(true);
			expect((err as Error).message).toBe('Recursion');
		}
	});
});

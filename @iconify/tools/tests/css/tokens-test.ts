import type { CSSToken, CSSTreeToken } from '../../src/css/parser/types.js';
import { getTokens } from '../../src/css/parser/tokens.js';
import { tokensTree } from '../../src/css/parser/tree.js';
import { tokensToString } from '../../src/css/parser/export.js';

describe('getTokens()', () => {
	test('Simple code', () => {
		const code = 'div { color: blue; }';
		const tokens = getTokens(code);
		const expected: CSSToken[] = [
			{ type: 'selector', code: 'div', index: 0, selectors: ['div'] },
			{ type: 'rule', prop: 'color', value: 'blue', index: 5 },
			{ type: 'close', index: 19 },
		];
		expect(tokens).toEqual(expected);

		const tree = tokensTree(tokens as CSSToken[]);
		const expectedTree: CSSTreeToken[] = [
			{
				type: 'selector',
				code: 'div',
				index: 0,
				selectors: ['div'],
				children: [
					{ type: 'rule', prop: 'color', value: 'blue', index: 5 },
				],
			},
		];
		expect(tree).toEqual(expectedTree);

		const output = tokensToString(tree);
		expect(output).toBe('div {\n\tcolor: blue;\n}\n');
	});

	test('Rules only, !important', () => {
		const code = 'color: red; opacity: 1; padding: 0 !important';
		const tokens = getTokens(code);
		const expected: CSSToken[] = [
			{ type: 'rule', prop: 'color', value: 'red', index: 0 },
			{ type: 'rule', prop: 'opacity', value: '1', index: 11 },
			{
				type: 'rule',
				prop: 'padding',
				value: '0',
				index: 23,
				important: true,
			},
		];
		expect(tokens).toEqual(expected);

		const tree = tokensTree(tokens as CSSToken[]);
		expect(tree).toEqual(expected);

		const output = tokensToString(tree);
		expect(output).toBe('color:red;opacity:1;padding:0;');
	});

	test('Multiple selectors', () => {
		const code =
			'a { color: red; text-decoration: none }\nb, c { font-weight: 500; }';
		const tokens = getTokens(code);
		const expected: CSSToken[] = [
			{ type: 'selector', code: 'a', index: 0, selectors: ['a'] },
			{ type: 'rule', prop: 'color', value: 'red', index: 3 },
			{ type: 'rule', prop: 'text-decoration', value: 'none', index: 15 },
			{ type: 'close', index: 38 },
			{
				type: 'selector',
				code: 'b, c',
				index: 39,
				selectors: ['b', 'c'],
			},
			{ type: 'rule', prop: 'font-weight', value: '500', index: 46 },
			{ type: 'close', index: 65 },
		];
		expect(tokens).toEqual(expected);

		const tree = tokensTree(tokens as CSSToken[]);
		const expectedTree: CSSTreeToken[] = [
			{
				type: 'selector',
				code: 'a',
				index: 0,
				selectors: ['a'],
				children: [
					{ type: 'rule', prop: 'color', value: 'red', index: 3 },
					{
						type: 'rule',
						prop: 'text-decoration',
						value: 'none',
						index: 15,
					},
				],
			},
			{
				type: 'selector',
				code: 'b, c',
				index: 39,
				selectors: ['b', 'c'],
				children: [
					{
						type: 'rule',
						prop: 'font-weight',
						value: '500',
						index: 46,
					},
				],
			},
		];
		expect(tree).toEqual(expectedTree);

		const output = tokensToString(tree);
		expect(output).toBe(
			'a {\n\tcolor: red;\n\ttext-decoration: none;\n}\nb, c {\n\tfont-weight: 500;\n}\n'
		);
	});

	test('@media', () => {
		const code =
			'a { color: red; text-decoration: none } @media (min-width: 700px) and (orientation: landscape), not all and (monochrome) { a { text-decoration: underline; } }';
		const tokens = getTokens(code);
		const expected: CSSToken[] = [
			{ type: 'selector', code: 'a', index: 0, selectors: ['a'] },
			{ type: 'rule', prop: 'color', value: 'red', index: 3 },
			{ type: 'rule', prop: 'text-decoration', value: 'none', index: 15 },
			{ type: 'close', index: 38 },
			{
				type: 'at-rule',
				index: 39,
				rule: 'media',
				value: '(min-width: 700px) and (orientation: landscape), not all and (monochrome)',
			},
			{ type: 'selector', code: 'a', index: 122, selectors: ['a'] },
			{
				type: 'rule',
				prop: 'text-decoration',
				value: 'underline',
				index: 126,
			},
			{ type: 'close', index: 155 },
			{ type: 'close', index: 157 },
		];
		expect(tokens).toEqual(expected);

		const tree = tokensTree(tokens as CSSToken[]);
		const expectedTree: CSSTreeToken[] = [
			{
				type: 'selector',
				code: 'a',
				index: 0,
				selectors: ['a'],
				children: [
					{ type: 'rule', prop: 'color', value: 'red', index: 3 },
					{
						type: 'rule',
						prop: 'text-decoration',
						value: 'none',
						index: 15,
					},
				],
			},

			{
				type: 'at-rule',
				index: 39,
				rule: 'media',
				value: '(min-width: 700px) and (orientation: landscape), not all and (monochrome)',
				children: [
					{
						type: 'selector',
						code: 'a',
						index: 122,
						selectors: ['a'],
						children: [
							{
								type: 'rule',
								prop: 'text-decoration',
								value: 'underline',
								index: 126,
							},
						],
					},
				],
			},
		];
		expect(tree).toEqual(expectedTree);

		const output = tokensToString(tree);
		expect(output).toBe(
			'a {\n\tcolor: red;\n\ttext-decoration: none;\n}\n@media (min-width: 700px) and (orientation: landscape), not all and (monochrome) {\n\ta {\n\t\ttext-decoration: underline;\n\t}\n}\n'
		);
	});

	test('SASS style nested selectors', () => {
		const code =
			'.foo { color: blue; & > .bar { color: red; } opacity: 1;}';
		const tokens = getTokens(code);
		const expected: CSSToken[] = [
			{ type: 'selector', code: '.foo', index: 0, selectors: ['.foo'] },
			{ type: 'rule', prop: 'color', value: 'blue', index: 6 },
			{
				type: 'selector',
				code: '& > .bar',
				index: 19,
				selectors: ['& > .bar'],
			},
			{ type: 'rule', prop: 'color', value: 'red', index: 30 },
			{ type: 'close', index: 43 },
			{ type: 'rule', prop: 'opacity', value: '1', index: 44 },
			{ type: 'close', index: 56 },
		];
		expect(tokens).toEqual(expected);

		const tree = tokensTree(tokens as CSSToken[]);
		const expectedTree: CSSTreeToken[] = [
			{
				type: 'selector',
				code: '.foo',
				index: 0,
				selectors: ['.foo'],
				children: [
					{ type: 'rule', prop: 'color', value: 'blue', index: 6 },
					{
						type: 'selector',
						code: '& > .bar',
						index: 19,
						selectors: ['& > .bar'],
						children: [
							{
								type: 'rule',
								prop: 'color',
								value: 'red',
								index: 30,
							},
						],
					},
					{ type: 'rule', prop: 'opacity', value: '1', index: 44 },
				],
			},
		];
		expect(tree).toEqual(expectedTree);

		const output = tokensToString(tree);
		expect(output).toBe(
			'.foo {\n\tcolor: blue;\n\t& > .bar {\n\t\tcolor: red;\n\t}\n\topacity: 1;\n}\n'
		);
	});

	test('URL with special characters', () => {
		const code =
			'div[some-attr="some { \\"content } "] { background: url("test;}{url"); color: blue; }';
		const tokens = getTokens(code);
		const expected: CSSToken[] = [
			{
				type: 'selector',
				code: 'div[some-attr="some { \\"content } "]',
				index: 0,
				selectors: ['div[some-attr="some { \\"content } "]'],
			},
			{
				type: 'rule',
				prop: 'background',
				value: 'url("test;}{url")',
				index: 38,
			},
			{ type: 'rule', prop: 'color', value: 'blue', index: 69 },
			{ type: 'close', index: 83 },
		];
		expect(tokens).toEqual(expected);

		const tree = tokensTree(tokens as CSSToken[]);
		const expectedTree: CSSTreeToken[] = [
			{
				type: 'selector',
				code: 'div[some-attr="some { \\"content } "]',
				index: 0,
				selectors: ['div[some-attr="some { \\"content } "]'],
				children: [
					{
						type: 'rule',
						prop: 'background',
						value: 'url("test;}{url")',
						index: 38,
					},
					{ type: 'rule', prop: 'color', value: 'blue', index: 69 },
				],
			},
		];
		expect(tree).toEqual(expectedTree);
	});

	test('@font-face', () => {
		const code =
			'@font-face { font-family: feedback-iconfont; src: url("//at.alicdn.com/t/font_1031158_u69w8yhxdu.woff2?t=1630033759944") format("woff2"), url("//at.alicdn.com/t/font_1031158_u69w8yhxdu.woff?t=1630033759944") format("woff"), url("//at.alicdn.com/t/font_1031158_u69w8yhxdu.ttf?t=1630033759944") format("truetype"); }';
		const tokens = getTokens(code);
		const expected: CSSToken[] = [
			{
				type: 'at-rule',
				index: 0,
				rule: 'font-face',
				value: '',
			},
			{
				type: 'rule',
				prop: 'font-family',
				value: 'feedback-iconfont',
				index: 12,
			},
			{
				type: 'rule',
				prop: 'src',
				value: 'url("//at.alicdn.com/t/font_1031158_u69w8yhxdu.woff2?t=1630033759944") format("woff2"), url("//at.alicdn.com/t/font_1031158_u69w8yhxdu.woff?t=1630033759944") format("woff"), url("//at.alicdn.com/t/font_1031158_u69w8yhxdu.ttf?t=1630033759944") format("truetype")',
				index: 44,
			},
			{ type: 'close', index: 313 },
		];
		expect(tokens).toEqual(expected);

		const tree = tokensTree(tokens as CSSToken[]);
		const expectedTree: CSSTreeToken[] = [
			{
				type: 'at-rule',
				index: 0,
				rule: 'font-face',
				value: '',
				children: [
					{
						type: 'rule',
						prop: 'font-family',
						value: 'feedback-iconfont',
						index: 12,
					},
					{
						type: 'rule',
						prop: 'src',
						value: 'url("//at.alicdn.com/t/font_1031158_u69w8yhxdu.woff2?t=1630033759944") format("woff2"), url("//at.alicdn.com/t/font_1031158_u69w8yhxdu.woff?t=1630033759944") format("woff"), url("//at.alicdn.com/t/font_1031158_u69w8yhxdu.ttf?t=1630033759944") format("truetype")',
						index: 44,
					},
				],
			},
		];
		expect(tree).toEqual(expectedTree);

		const output = tokensToString(tree);
		expect(output).toBe(
			'@font-face {\n\tfont-family: feedback-iconfont;\n\tsrc: url("//at.alicdn.com/t/font_1031158_u69w8yhxdu.woff2?t=1630033759944") format("woff2"), url("//at.alicdn.com/t/font_1031158_u69w8yhxdu.woff?t=1630033759944") format("woff"), url("//at.alicdn.com/t/font_1031158_u69w8yhxdu.ttf?t=1630033759944") format("truetype");\n}\n'
		);
	});
});

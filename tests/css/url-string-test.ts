import { findEndOfURL } from '../../lib/css/parser/strings';

describe('findEndOfURL()', () => {
	test('Simple code', () => {
		const testStr =
			'div { background: url(data:image/png;base64,whatever/*}{&); color: blue; }';
		const testStartIndex = testStr.indexOf('url');
		const expectedIndex = testStr.indexOf(')') + 1;
		expect(findEndOfURL(testStr, testStartIndex)).toBe(expectedIndex);
	});

	test('Quoted URL', () => {
		const testStr = 'div { background: url("test;}{url"); color: blue; }';
		const testStartIndex = testStr.indexOf('url');
		const expectedIndex = testStr.indexOf(')') + 1;
		expect(findEndOfURL(testStr, testStartIndex)).toBe(expectedIndex);
	});
});

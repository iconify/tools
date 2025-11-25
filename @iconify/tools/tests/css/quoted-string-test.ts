import { findEndOfQuotedString } from '../../src/css/parser/strings.js';

describe('findEndOfQuotedString()', () => {
	test('Simple code', () => {
		const testStr = 'div { background: url("test;}{url"); color: blue; }';
		const testChar = '"';
		const testStartIndex = testStr.indexOf(testChar);
		const expectedIndex =
			testStr.slice(testStartIndex + 1).indexOf(testChar) +
			testStartIndex +
			2;
		expect(findEndOfQuotedString(testStr, testChar, testStartIndex)).toBe(
			expectedIndex
		);
	});

	test('Simple code 2', () => {
		const testStr = '.foo { color: red; @import "bar.css"; opacity: 0 }';
		const testChar = '"';
		const testStartIndex = testStr.indexOf(testChar);
		const expectedIndex =
			testStr.slice(testStartIndex + 1).indexOf(testChar) +
			testStartIndex +
			2;
		expect(findEndOfQuotedString(testStr, testChar, testStartIndex)).toBe(
			expectedIndex
		);
	});

	test('No end quote', () => {
		const testStr = "This is a test 'with quote";
		const testChar = "'";
		const testStartIndex = testStr.indexOf(testChar);
		expect(
			findEndOfQuotedString(testStr, testChar, testStartIndex)
		).toBeNull();
	});

	test('Escaped character', () => {
		const testStr = "span[data-foo='test\"\\'str']";
		const testChar = "'";
		const testStartIndex = testStr.indexOf(testChar);
		const expectedIndex =
			testStr.slice(testStartIndex + 1).indexOf(testChar) +
			testStartIndex +
			2 +
			// 4 characters after next match
			4;
		expect(findEndOfQuotedString(testStr, testChar, testStartIndex)).toBe(
			expectedIndex
		);
	});
});

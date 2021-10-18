import { cleanupIconKeyword } from '../../lib/misc/keyword';

describe('Icon keywords', () => {
	test('Converting strings', () => {
		expect(cleanupIconKeyword('foo')).toBe('foo');
		expect(cleanupIconKeyword('1f1e7-1f1fe')).toBe('1f1e7-1f1fe');
		expect(cleanupIconKeyword('some-icon.svg')).toBe('some-icon-svg');
		expect(cleanupIconKeyword('u1F30A')).toBe('u1f30a');
		expect(cleanupIconKeyword('_icon_#')).toBe('icon');
	});

	test('camelCase strings', () => {
		expect(cleanupIconKeyword('someIcon', true)).toBe('some-icon');
		expect(cleanupIconKeyword('E1F30A', true)).toBe('e1-f30-a');
	});

	test('Empty strings', () => {
		expect(cleanupIconKeyword('`', true)).toBe('');
		expect(cleanupIconKeyword('#', true)).toBe('');
	});
});

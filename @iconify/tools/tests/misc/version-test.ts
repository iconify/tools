import { bumpVersion } from '../../lib/misc/bump-version';

describe('Version number', () => {
	test('Bumping version', () => {
		// Simple numbers
		expect(bumpVersion('1.0.0')).toBe('1.0.1');
		expect(bumpVersion('1.2.3.4')).toBe('1.2.3.5');
		expect(bumpVersion('1.0.0-beta.1')).toBe('1.0.0-beta.2');

		// No numbers at the end
		expect(bumpVersion('2.0.0-dev')).toBe('2.0.0-dev.1');
	});
});

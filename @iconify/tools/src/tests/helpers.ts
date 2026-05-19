import { readFile } from 'node:fs/promises';

/**
 * Test helper: load fixture
 */
export async function loadFixture(file: string): Promise<string> {
	return await readFile('tests/fixtures/' + file, 'utf8');
}

/**
 * Checks if running tests that download stuff
 *
 * These tests are disabled for quick testing and CI
 */
export function isTestingRemote(): boolean {
	return process.env['TEST_REMOTE'] !== 'false';
}

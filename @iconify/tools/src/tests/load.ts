import { promises as fs } from 'fs';

/**
 * Test helper: load fixture
 */
export async function loadFixture(file: string): Promise<string> {
	return await fs.readFile('tests/fixtures/' + file, 'utf8');
}

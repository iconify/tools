import { promises as fs } from 'fs';
import { join } from 'pathe';

/**
 * Load fixture
 */
export async function loadFixture(file: string): Promise<string> {
	return await fs.readFile(join(__dirname, `./fixtures/${file}`), 'utf8');
}

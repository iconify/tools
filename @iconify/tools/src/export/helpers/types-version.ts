// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('@iconify/types/package.json');

/**
 * Get current version of Iconify Types package
 */
export function getTypesVersion(): string {
	return pkg.version;
}

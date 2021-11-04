import pkg from '@iconify/types/package.json';

/**
 * Get current version of Iconify Types package
 */
export function getTypesVersion(): string {
	return pkg.version;
}

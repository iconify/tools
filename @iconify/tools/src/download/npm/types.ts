/**
 * Package options
 */
export interface NPMPackageOptions {
	// Package
	package: string;

	// Tag, default is 'latest'
	tag?: string;

	// Use fetch instead of 'npm' command to get version
	// Can be used in environments where 'npm' command is not available
	fetch?: boolean;
}

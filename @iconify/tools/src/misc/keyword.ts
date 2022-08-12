/**
 * Clean up keyword
 */
export function cleanupIconKeyword(
	keyword: string,
	convertCamelCase = false
): string {
	// Convert camelCase to dash-case
	if (convertCamelCase) {
		keyword = keyword.replace(
			/[A-Z]+/g,
			(chars) => '_' + chars.toLowerCase()
		);
	}

	// Replace stuff
	keyword = keyword
		.toLowerCase()
		.trim()
		// Replace few characters with dash
		.replace(/[\s_.:]/g, '-')
		// Remove bad characters
		.replace(/[^a-z0-9-]/g, '')
		// Replace repeating dash
		.replace(/[-]+/g, '-');

	// Remove '-' at start and end
	if (keyword.slice(0, 1) === '-') {
		keyword = keyword.slice(1);
	}
	if (keyword.slice(-1) === '-') {
		keyword = keyword.slice(0, -1);
	}

	return keyword;
}

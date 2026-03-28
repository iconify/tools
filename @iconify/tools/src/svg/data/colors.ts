/**
 * Check for color attribute
 */
export function isSVGColorAttribute(prop: string): boolean {
	return prop === 'fill' || prop === 'stroke' || prop.endsWith('color');
}

/**
 * Check for color that cannot be parsed
 */
export function isBadSVGColor(value: string): boolean {
	return (
		value.startsWith('color(') ||
		value.startsWith('device-color(') ||
		value.startsWith('var(')
	);
}

/**
 * Bump version number
 */
export function bumpVersion(version: string): string {
	const versionParts = version.split('.');
	const lastPart = versionParts.pop() as string;
	const num = parseInt(lastPart);
	if (isNaN(num) || num.toString() !== lastPart) {
		versionParts.push(lastPart + '.1');
	} else {
		versionParts.push((num + 1).toString());
	}
	return versionParts.join('.');
}

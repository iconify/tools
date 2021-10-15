import type { CSSToken, CSSTreeToken } from './types';

/**
 * Convert tokens list to tree
 */
export function tokensTree(tokens: CSSToken[]): CSSTreeToken[] {
	const result: CSSTreeToken[] = [];
	let index = 0;

	function parse(target: CSSTreeToken[]): void {
		while (index < tokens.length) {
			const token = tokens[index];
			index++;

			switch (token.type) {
				case 'close':
					return;

				case 'selector':
				case 'at-rule': {
					const newItem = {
						...token,
						children: [],
					};
					target.push(newItem);
					parse(newItem.children);
					break;
				}

				default:
					target.push(token);
			}
		}
	}

	while (index < tokens.length) {
		parse(result);
	}

	return result;
}

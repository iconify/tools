import type { CSSATValue, CSSTreeToken } from './types';

const tab = '\t';
const nl = '\n';

/**
 * Convert tokens tree to string
 */
export function tokensToString(tree: CSSTreeToken[]): string {
	let compact = true;
	for (let i = 0; i < tree.length; i++) {
		if (tree[i].type !== 'rule') {
			compact = false;
			break;
		}
	}

	return tree
		.map((token) => {
			return parseToken(token, compact, 0);
		})
		.join('');
}

/**
 * Old code
 */

function parseToken(
	token: CSSTreeToken,
	compact: boolean,
	depth: number
): string {
	let content: string;
	switch (token.type) {
		case 'rule': {
			return (
				(compact ? '' : tab.repeat(depth)) +
				token.prop +
				(compact ? ':' : ': ') +
				token.value +
				';' +
				(compact ? '' : nl)
			);
		}

		case 'at-rule': {
			content =
				'@' + token.atRule + joinAtValues(token.atValues, compact);
			break;
		}

		case 'selector': {
			content = token.selectors.join(compact ? ',' : ', ');
		}
	}

	const children = token.children.map((item) => {
		return parseToken(item, compact, depth + 1);
	});

	return (
		(compact ? '' : tab.repeat(depth)) +
		content +
		(compact ? '{' : ' {' + nl) +
		children.join('') +
		(compact ? '}' : tab.repeat(depth) + '}' + nl)
	);
}

/**
 * Join at-rule values
 */
function joinAtValues(values: CSSATValue[], compact: boolean): string {
	return values
		.map((item) => {
			const value =
				typeof item === 'string' ? item : joinAtValues(item, compact);
			if (value.slice(0, 1) === '(' || value.slice(-1) === ')') {
				return value;
			}
			return '(' + value + ')';
		})
		.join(compact ? ',' : ', ');
}

import { optimize } from 'svgo';
import type { OptimizeOptions } from 'svgo';
import type { SVG } from '..';
import { parseSVG } from '../parse';
import { getTokens } from '../../css/parser/tokens';
import { badAttributes, badSoftwareAttributes } from '../data/attributes';
import { tokensTree } from '../../css/parser/tree';
import { tokensToString } from '../../css/parser/export';

/**
 * Expand inline style
 */
export async function convertStyleToAttrs(svg: SVG): Promise<void> {
	let hasInlineStyle = false;
	let hasStyleTag = false;

	// Clean up style, removing useless junk
	await parseSVG(svg, (item) => {
		if (item.tagName !== 'style') {
			if (item.element.attribs.style !== void 0) {
				hasInlineStyle = true;
			}
			return;
		}

		item.testChildren = false;
		const content = item.$element.html();
		if (typeof content !== 'string') {
			item.$element.remove();
			return;
		}

		// Parse CSS
		let tokens = getTokens(content);
		if (!(tokens instanceof Array)) {
			// Invalid style
			throw new Error('Error parsing style');
		}

		// Remove some stuff from tokens
		tokens = tokens.filter((token) => {
			switch (token.type) {
				case 'rule': {
					const prop = token.prop;
					if (
						// Browser specific junk
						prop.slice(0, 1) === '-' ||
						// Attributes / properties now allowed
						badAttributes.has(prop) ||
						badSoftwareAttributes.has(prop)
					) {
						return false;
					}
				}
			}

			return true;
		});

		// Convert to tree
		const tree = tokensTree(tokens);
		if (!tree.length) {
			// Empty
			item.$element.remove();
			return;
		}

		// Update style
		const newContent = tokensToString(tree);
		item.$element.text(newContent);

		hasStyleTag = true;
	});

	// Nothing to check?
	if (!hasInlineStyle && !hasStyleTag) {
		return;
	}

	// Run SVGO
	const options: OptimizeOptions = {
		plugins: ['convertStyleToAttrs', 'inlineStyles'],
		multipass: true,
	};

	// Load data
	const result = optimize(svg.toString(), options);
	svg.load(result.data);
}

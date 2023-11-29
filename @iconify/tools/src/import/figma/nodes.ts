import type { FigmaDocument, FigmaNode, IconFigmaNode } from './types/api';
import type {
	FigmaImportIconNodeType,
	FigmaImportNodeData,
	FigmaImportParentNodeType,
	FigmaParentNodeData,
} from './types/nodes';
import type { FigmaGetIconNodesOptions } from './types/options';
import type { FigmaNodesImportResult } from './types/result';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertNever(v: never) {
	//
}

/**
 * Get node ids for icons
 */
export function getFigmaIconNodes(
	document: FigmaDocument,
	options: FigmaGetIconNodesOptions
): FigmaNodesImportResult {
	const nodes: FigmaNodesImportResult = {
		icons: Object.create(null) as FigmaNodesImportResult['icons'],
	};
	let found = 0;

	const check = (node: FigmaNode, parents: FigmaParentNodeData[]) => {
		// Check if node can be icon
		const iconNodeType = node.type as FigmaImportIconNodeType;
		switch (iconNodeType) {
			case 'COMPONENT':
			case 'INSTANCE':
			case 'FRAME': {
				const iconNode = node as IconFigmaNode;
				if (iconNode.absoluteBoundingBox) {
					const box = iconNode.absoluteBoundingBox;
					const item: FigmaImportNodeData = {
						...node,
						type: iconNodeType,
						width: box.width,
						height: box.height,
						parents,
					};
					const keyword = options.iconNameForNode(
						item,
						nodes,
						document
					);
					if (typeof keyword === 'string') {
						// Keyword
						found++;
						nodes.icons[node.id] = {
							id: node.id,
							name: node.name,
							keyword,
						};
						return;
					}
					if (
						keyword &&
						typeof keyword === 'object' &&
						typeof keyword.keyword === 'string'
					) {
						// Full item, possibly with custom properties
						found++;
						nodes.icons[node.id] = {
							...keyword,
							id: node.id,
							name: node.name,
						};
						return;
					}
				}
				break;
			}

			default:
				assertNever(iconNodeType);
		}

		// Check if node is a valid parent node
		if (!node.children) {
			return;
		}
		const parentNodeType = node.type as FigmaImportParentNodeType;
		switch (parentNodeType) {
			case 'CANVAS':
			case 'FRAME':
			case 'GROUP':
			case 'SECTION': {
				const parentItem: FigmaParentNodeData = {
					...node,
					type: parentNodeType,
				};
				const newParents = parents.concat([parentItem]);

				if (!parents.length && options.pages) {
					// Check page against allowed pages list
					const allowedPages = options.pages;
					if (
						!allowedPages.includes(node.id) &&
						!allowedPages.includes(node.name.trim())
					) {
						return;
					}
				} else {
					// Use callback
					if (
						options.filterParentNode &&
						!options.filterParentNode(newParents, document)
					) {
						return;
					}
				}

				node.children.forEach((childNode) => {
					check(childNode, newParents);
				});
				break;
			}

			default:
				assertNever(parentNodeType);
		}
	};
	document.document.children.forEach((node) => {
		check(node, []);
	});

	nodes.nodesCount = found;
	return nodes;
}

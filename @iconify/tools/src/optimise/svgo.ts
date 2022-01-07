import { optimize } from 'svgo';
import type { OptimizeOptions, Plugin } from 'svgo';
import type { SVG } from '../svg';

export const defaultSVGOPlugins: Plugin[] = [
	'cleanupAttrs',
	'mergeStyles',
	'inlineStyles',
	'removeComments',
	'removeUselessDefs',
	'removeEditorsNSData',
	'removeEmptyAttrs',
	'removeEmptyContainers',
	'convertStyleToAttrs',
	'convertColors',
	'convertTransform',
	'removeUnknownsAndDefaults',
	'removeNonInheritableGroupAttrs',
	'removeUselessStrokeAndFill',
	'removeUnusedNS',
	'cleanupNumericValues',
	'cleanupListOfValues',
	'moveElemsAttrsToGroup',
	'moveGroupAttrsToElems',
	'collapseGroups',
	'sortDefsChildren',
	'sortAttrs',
];

/**
 * Plugins that modify shapes. Added to plugins list, unless 'keepShapes' option is enabled
 */
export const shapeModifiyingSVGOPlugins: Plugin[] = [
	'removeHiddenElems',
	'convertShapeToPath',
	'convertEllipseToCircle',
	{
		name: 'convertPathData',
		params: {
			noSpaceAfterFlags: true,
		},
	},
	{
		name: 'mergePaths',
		params: {
			noSpaceAfterFlags: true,
		},
	},
	'removeOffCanvasPaths',
	'reusePaths',
];

/**
 * Options
 */
interface SVGOCommonOptions {
	// Parse SVG multiple times for better optimisation
	multipass?: boolean;
}

// Options list with custom plugins list
interface SVGOOptionsWithPlugin extends SVGOCommonOptions {
	// Custom SVGO plugins list
	plugins: Plugin[];
}

// Options list without plugins list
interface SVGOptionsWithoutPlugin extends SVGOCommonOptions {
	plugins?: undefined;

	// Keep shapes: doesn't run plugins that mess with shapes
	keepShapes?: boolean;

	// Cleanup IDs, value is prefix to add to IDs, default is 'svg-'. False to disable it
	cleanupIDs?: string | false;
}

type SVGOOptions = SVGOOptionsWithPlugin | SVGOptionsWithoutPlugin;

/**
 * Run SVGO on icon
 */
export async function runSVGO(
	svg: SVG,
	options: SVGOOptions = {}
): Promise<void> {
	// Code
	const code = svg.toString();

	// Options
	const multipass = options.multipass !== false;

	// Plugins list
	let plugins: Plugin[];
	if (options.plugins) {
		plugins = options.plugins;
	} else {
		// Check for animations: convertShapeToPath and removeHiddenElems plugins currently might ruin animations
		let keepShapes = options.keepShapes;
		if (
			keepShapes === void 0 &&
			(code.indexOf('<animate') !== -1 || code.indexOf('<set') !== -1)
		) {
			// Do not check animations: just assume they might break
			keepShapes = true;
		}

		plugins = defaultSVGOPlugins.concat(
			keepShapes ? [] : shapeModifiyingSVGOPlugins,
			options.cleanupIDs !== false
				? [
						{
							name: 'cleanupIDs',
							params: {
								prefix:
									typeof options.cleanupIDs === 'string'
										? options.cleanupIDs
										: 'svg-',
							},
						},
				  ]
				: []
		);
	}

	// Run SVGO
	const pluginOptions: OptimizeOptions = {
		plugins,
		multipass,
	};

	// Load data (changing type because SVGO types do not include error ?????)
	const result = optimize(code, pluginOptions) as unknown as Record<
		string,
		string
	>;
	if (typeof result.error === 'string') {
		throw new Error(result.error);
	}

	// Sometimes empty definitions are not removed: remove them
	const content = result.data.replace(/<defs\/>/g, '');
	svg.load(content);
}

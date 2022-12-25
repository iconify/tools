import { optimize } from 'svgo';
import type { Config, PluginConfig } from 'svgo';
import type { SVG } from '../svg';

interface CleanupIDsOption {
	// Cleanup IDs, value is prefix to add to IDs, default is 'svgID'. False to disable it
	// Do not use dashes in ID, it breaks some SVG animations
	cleanupIDs?: string | false;
}

interface GetSVGOPluingOptions extends CleanupIDsOption {
	animated?: boolean;
	keepShapes?: boolean;
}

/**
 * Get list of plugins
 */
export function getSVGOPlugins(options: GetSVGOPluingOptions): PluginConfig[] {
	return [
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
		'removeUnusedNS',
		'cleanupNumericValues',
		'cleanupListOfValues',
		'moveElemsAttrsToGroup',
		'moveGroupAttrsToElems',
		'collapseGroups',
		'sortDefsChildren',
		'sortAttrs',

		// Plugins that are bugged when using animations
		...((options.animated
			? []
			: ['removeUselessStrokeAndFill']) as PluginConfig[]),

		// Plugins that modify shapes or are bugged when using animations
		...((options.animated || options.keepShapes
			? []
			: [
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
					// 'removeOffCanvasPaths', // bugged for some icons
					'reusePaths',
			  ]) as PluginConfig[]),

		// Clean up IDs
		...((options.cleanupIDs !== false
			? [
					{
						name: 'cleanupIds',
						params: {
							prefix:
								typeof options.cleanupIDs === 'string'
									? options.cleanupIDs
									: 'svgID',
						},
					},
			  ]
			: []) as PluginConfig[]),
	];
}

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
	plugins: PluginConfig[];
}

// Options list without plugins list
interface SVGOptionsWithoutPlugin extends SVGOCommonOptions, CleanupIDsOption {
	plugins?: undefined;

	// Keep shapes: doesn't run plugins that mess with shapes
	keepShapes?: boolean;
}

type SVGOOptions = SVGOOptionsWithPlugin | SVGOptionsWithoutPlugin;

/**
 * Run SVGO on icon
 */
export function runSVGO(svg: SVG, options: SVGOOptions = {}) {
	// Code
	const code = svg.toString();

	// Options
	const multipass = options.multipass !== false;

	// Plugins list
	let plugins: PluginConfig[];
	if (options.plugins) {
		plugins = options.plugins;
	} else {
		// Check for animations: convertShapeToPath and removeHiddenElems plugins currently might ruin animations
		const animated =
			code.indexOf('<animate') !== -1 || code.indexOf('<set') !== -1;

		plugins = getSVGOPlugins({
			...options,
			animated,
		});
	}

	// Run SVGO
	const pluginOptions: Config = {
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

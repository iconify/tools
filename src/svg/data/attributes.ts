/**
 * This list is highly opinionated. It is designed to handle icons that can be safely embedded in HTML and linked as external source.
 * Icons cannot have anything that requires external resources, anything that renders inconsistently.
 */

import { filterChildTags, shapeTags } from './tags';

/***** Attributes that are not part of tag specific stuff *****/
/**
 * Attributes that icons should not mess with or that are irrelevant. They should be removed
 */
export const badAttributes = new Set([
	'cursor',
	'pointer-events',
	'shape-rendering',
	'tabindex',
	'requiredExtensions',
	'requiredFeatures',
	'systemLanguage',
	'role',
	'title',
]);

/**
 * Attributes for SVG element that should be removed
 */
export const junkSVGAttributes = new Set([
	'xmlns:xlink',
	'baseProfile',
	'contentScriptType',
	'contentStyleType',
	'version',
	'x',
	'y',
	'zoomAndPan',
]);

/**
 * Attributes and styles often added by bad software to wrong tags, such as Adobe Illustrator and Inkscape
 */
export const badSoftwareAttributes = new Set([
	'color-interpolation-filters',
	'isolation',
	'enable-background',
	'overflow',
	'marker',
	'white-space',
	// Font stuff
	'direction',
]);

// Prefixes. First part of attribute before '-', where all possible attributes that start with prefix are invalid
export const badSoftwareAttributePrefixes = new Set([
	'image',
	'mix',
	'block',
	// Font stuff
	'text',
	'font',
	'letter',
	'baseline',
	'word',
	'line',
	'writing',
	// Prefix for browser specific stuff
	'',
]);

/**
 * Common attributes that can exist on any element
 */
export const commonAttributes = new Set(['id']);

export const stylingAttributes = new Set(['class', 'style']);

/**
 * Attributes that exist only on child elements of <clipPath>
 */
export const insideClipPathAttributes = new Set(['clip-rule']);

/***** Other attributes, added to tagSpecificAttributes variable below *****/
/**
 * Presentational attributes
 */
// Attributes used for shapes with fill to change fill style
export const fillPresentationalAttributes = new Set([
	'fill-opacity',
	'fill-rule',
]);

// Attributes used for shapes with stroke to change stroke style
export const strokePresentationalAttributes = new Set([
	'stroke-dasharray',
	'stroke-dashoffset',
	'stroke-linecap',
	'stroke-linejoin',
	'stroke-miterlimit',
	'stroke-opacity',
	'stroke-width',
]);

// Attributes where value is an url()
export const urlPresentationalAttributes = new Set([
	'clip-path',
	'filter',
	'mask',
]);

// Visibility
export const visibilityPresentationalAttributes = new Set([
	'display',
	'opacity',
	'visibility',
]);

// Color values
export const commonColorPresentationalAttributes = new Set([
	'color',
	'fill',
	'stroke',
]);

// Other presentational attributes
export const otherPresentationalAttributes = new Set([
	'color-interpolation',
	'color-rendering',
	'transform',
	'vector-effect',
]);

// All presentational attributes
export const presentationalAttributes = new Set([
	...fillPresentationalAttributes,
	...strokePresentationalAttributes,
	...urlPresentationalAttributes,
	...visibilityPresentationalAttributes,
	...commonColorPresentationalAttributes,
	...otherPresentationalAttributes,
]);

/**
 * Markers
 *
 * Presentational attributes
 */
export const markerAttributes = new Set([
	'marker-start',
	'marker-mid',
	'marker-end',
]);

/**
 * Shapes
 *
 * Not presentational
 */
export const otherShapeAttributes = new Set(['pathLength']);

/**
 * Animations
 */
export const animationTimingAttributes = new Set([
	'begin',
	'dur',
	'end',
	'min',
	'max',
	'restart',
	'repeatCount',
	'repeatDur',
	'fill',
]);

export const animationValueAttributes = new Set([
	'calcMode',
	'values',
	'keyTimes',
	'keySplines',
	'from',
	'to',
	'by',
]);

export const otherAnimationAttributes = new Set([
	'attributeName',
	'additive',
	'accumulate',
]);

/**
 * Gradients
 */
export const commonGradientAttributes = new Set([
	'gradientUnits',
	'gradientTransform',
	'href',
	'spreadMethod',
]);

/**
 * Filters
 */
// Presentational, supported by most filters
export const commonFeAttributes = new Set([
	'x',
	'y',
	'width',
	'height',
	'color-interpolation-filters',
]);

export const feFuncAttributes = new Set([
	'type',
	'tableValues',
	'slope',
	'intercept',
	'amplitude',
	'exponent',
	'offset',
	...commonFeAttributes,
]);

/**
 * Tag specific attributes
 */
// Attributes, can be used in animations
// Most attributes can also be used in style
export const tagSpecificAnimatedAttributes: Record<string, Set<string>> = {
	circle: new Set(['cx', 'cy', 'r']),
	ellipse: new Set(['cx', 'cy', 'rx', 'ry']),
	line: new Set(['x1', 'x2', 'y1', 'y2']),
	path: new Set(['d']),
	polygon: new Set(['points']),
	polyline: new Set(['points']),
	rect: new Set(['x', 'y', 'width', 'height', 'rx', 'ry']),
};

// Presentational attributes supported by tags
export const tagSpecificPresentationalAttributes: Record<
	string,
	Set<string>
> = {
	// SVG
	svg: new Set(['width', 'height', ...presentationalAttributes]),

	// Defnitions, containers and masks
	clipPath: new Set([...presentationalAttributes]),
	defs: new Set([...presentationalAttributes]),
	g: new Set([...presentationalAttributes]),
	mask: new Set(['x', 'y', 'width', 'height', ...presentationalAttributes]),
	symbol: new Set(['x', 'y', 'width', 'height', ...presentationalAttributes]),

	// Use
	use: new Set([
		'x',
		'y',
		'width',
		'height',
		'refX',
		'refY',
		...presentationalAttributes,
	]),

	// Marker
	marker: new Set([...presentationalAttributes]),

	// Gradients
	linearGradient: new Set([
		'x1',
		'x2',
		'y1',
		'y2',
		...presentationalAttributes,
	]),
	radialGradient: new Set([
		'cx',
		'cy',
		'fr',
		'fx',
		'fy',
		'r',
		...presentationalAttributes,
	]),
	stop: new Set(['offset', 'stop-color', 'stop-opacity']),

	// Filters
	feFlood: new Set(['flood-color', 'flood-opacity']),
	feDropShadow: new Set(['flood-color', 'flood-opacity']),
};
shapeTags.forEach((tag) => {
	tagSpecificPresentationalAttributes[tag] = new Set([
		...presentationalAttributes,
		...markerAttributes,
		...(tagSpecificPresentationalAttributes[tag] || []),
	]);
});
filterChildTags.forEach((tag) => {
	tagSpecificPresentationalAttributes[tag] = new Set([
		...commonFeAttributes,
		...(tagSpecificPresentationalAttributes[tag] || []),
	]);
});

// Non-presentational attributes supported by tags
export const tagSpecificNonPresentationalAttributes: Record<
	string,
	Set<string>
> = {
	// SVG
	svg: new Set(['xmlns', 'viewBox', 'preserveAspectRatio']),

	// Defnitions, containers and masks
	clipPath: new Set(['clipPathUnits']),
	mask: new Set(['maskContentUnits', 'maskUnits']),
	symbol: new Set(['viewBox', 'preserveAspectRatio']),

	// Shapes
	circle: new Set([...otherShapeAttributes]),
	ellipse: new Set([...otherShapeAttributes]),
	line: new Set([...otherShapeAttributes]),
	path: new Set([...otherShapeAttributes]),
	polygon: new Set([...otherShapeAttributes]),
	polyline: new Set([...otherShapeAttributes]),
	rect: new Set([...otherShapeAttributes]),

	// Use
	use: new Set(['href']),

	// Marker
	marker: new Set([
		'markerHeight',
		'markerUnits',
		'markerWidth',
		'orient',
		'preserveAspectRatio',
		'refX',
		'refY',
		'viewBox',
	]),

	// Animations
	animate: new Set([
		...animationTimingAttributes,
		...animationValueAttributes,
		...otherAnimationAttributes,
	]),
	animateMotion: new Set([
		'keyPoints',
		'path',
		'rotate',
		...animationTimingAttributes,
		...animationValueAttributes,
		...otherAnimationAttributes,
	]),
	animateTransform: new Set([
		'by',
		'from',
		'to',
		'type',
		...animationTimingAttributes,
		...animationValueAttributes,
		...otherAnimationAttributes,
	]),
	discard: new Set(['begin', 'href']),
	set: new Set([
		'to',
		...animationTimingAttributes,
		...otherAnimationAttributes,
	]),
	mpath: new Set(['href']),

	// Gradients
	linearGradient: new Set([...commonGradientAttributes]),
	radialGradient: new Set([...commonGradientAttributes]),

	// Filters
	feSpotLight: new Set([
		'x',
		'y',
		'z',
		'pointsAtX',
		'pointsAtY',
		'pointsAtZ',
		'specularExponent',
		'limitingConeAngle',
	]),
	feBlend: new Set(['in', 'in2', 'mode']),
	feColorMatrix: new Set(['in', 'type', 'values']),
	feComponentTransfer: new Set(['in']),
	feComposite: new Set(['in', 'in2', 'operator', 'k1', 'k2', 'k3', 'k4']),
	feConvolveMatrix: new Set([
		'in',
		'order',
		'kernelMatrix',
		'divisor',
		'bias',
		'targetX',
		'targetY',
		'edgeMode',
		'kernelUnitLength',
		'preserveAlpha',
	]),
	feDiffuseLighting: new Set([
		'in',
		'surfaceScale',
		'diffuseConstant',
		'kernelUnitLength',
	]),
	feDisplacementMap: new Set([
		'in',
		'in2',
		'scale',
		'xChannelSelector',
		'yChannelSelector',
	]),
	feDistantLight: new Set(['azimuth', 'elevation']),
	feDropShadow: new Set(['dx', 'dy', 'stdDeviation']),
	feGaussianBlur: new Set(['in', 'stdDeviation', 'edgeMode']),
	feFuncA: feFuncAttributes,
	feFuncR: feFuncAttributes,
	feFuncG: feFuncAttributes,
	feFuncB: feFuncAttributes,
	feMergeNode: new Set(['in']),
	feMorphology: new Set(['in', 'operator', 'radius']),
	feOffset: new Set(['in', 'dx', 'dy']),
	fePointLight: new Set(['x', 'y', 'z']),
	feSpecularLighting: new Set([
		'in',
		'surfaceScale',
		'specularConstant',
		'specularExponent',
		'kernelUnitLength',
	]),
	feTile: new Set(['in']),
	feTurbulence: new Set([
		'baseFrequency',
		'numOctaves',
		'seed',
		'stitchTiles',
		'type',
	]),
};

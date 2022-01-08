/**
 * This list is highly opinionated. It is designed to handle icons that can be safely embedded in HTML and linked as external source.
 * Icons cannot have anything that requires external resources, anything that renders inconsistently.
 */

/**
 * Bad tags
 *
 * Parser should throw error if one of these tags is found
 *
 * List includes text tags because:
 * - it usuaully uses custom font, which makes things much more complex
 * - it renders differently on different operating systems and browsers
 *
 * View tag is not allowed because it requires targeting view by id from external source, making it unusable in embedded icons.
 */
export const badTags = new Set([
	// Nasty stuff or external resource
	'foreignObject',
	'script',
	'image',
	'feImage',
	// Deprecated
	'animateColor',
	'altGlyph',
	// Text
	'text',
	'tspan',
	'switch',
	'textPath',
	// Font
	'font',
	'font-face',
	'glyph',
	'missing-glyph',
	'hkern',
	'vhern',
	// View
	'view',
	// Link
	'a',
]);

/**
 * Deprecated or irrelevant tags
 *
 * Tags that are quietly removed
 */
export const unsupportedTags = new Set(['metadata', 'desc', 'title']);

/**
 * Style
 */
export const styleTag = new Set(['style']);

/**
 * Definitions: reusable elements inside
 */
export const defsTag = new Set(['defs']);

/**
 * Masks: colors are ignored, child elements must have id
 */
export const maskAndSymbolTags = new Set(['clipPath', 'mask', 'symbol']);

/**
 * SVG shapes
 */
export const shapeTags = new Set([
	'circle',
	'ellipse',
	'line',
	'path',
	'polygon',
	'polyline',
	'rect',
]);

/**
 * Use
 */
export const useTag = new Set(['use']);

/**
 * Groups
 */
export const groupTag = new Set(['g']);

/**
 * Marker, must be inside <defs>
 */
export const markerTag = new Set(['marker']);

/**
 * SVG animations
 */
export const animateTags = new Set([
	'animate',
	'animateMotion',
	'animateTransform',
	'discard',
	'set',
]);

export const animateMotionChildTags = new Set(['mpath']);

/**
 * Gradients, must be inside <defs>
 */
export const gradientTags = new Set(['linearGradient', 'radialGradient']);

/**
 * Gradient color, must be inside one of gradientTags
 */
export const gradientChildTags = new Set(['stop']);

/**
 * Pattern, must be inside <defs>
 */
export const patternTag = new Set(['pattern']);

/**
 * Filters
 */
export const filterTag = new Set(['filter']);

export const feLightningTags = new Set([
	'feDiffuseLighting',
	'feSpecularLighting',
]);

export const filterChildTags = new Set([
	'feBlend',
	'feColorMatrix',
	'feComponentTransfer',
	'feComposite',
	'feConvolveMatrix',
	'feDisplacementMap',
	'feDropShadow',
	'feFlood',
	'feGaussianBlur',
	'feMerge',
	'feMorphology',
	'feOffset',
	'feTile',
	'feTurbulence',
	...feLightningTags,
]);

export const feComponentTransferChildTag = new Set([
	'feFuncR',
	'feFuncG',
	'feFuncB',
	'feFuncA',
]);

export const feLightningChildTags = new Set([
	'feSpotLight',
	'fePointLight',
	'feDistantLight',
]);

export const feMergeChildTags = new Set(['feMergeNode']);

/***** Combination of tags *****/
/**
 * Tags that can be used only inside <defs>
 */
export const tagsInsideDefs = new Set([
	...gradientTags,
	...patternTag,
	...markerTag,
]);

/**
 * All supported tags
 */
export const allValidTags = new Set([
	...styleTag,
	...defsTag,
	...maskAndSymbolTags,
	...shapeTags,
	...useTag,
	...groupTag,
	...markerTag,
	...animateTags,
	...animateMotionChildTags,
	...gradientTags,
	...gradientChildTags,
	...patternTag,
	...filterTag,
	...filterChildTags,
	...feComponentTransferChildTag,
	...feLightningChildTags,
	...feMergeChildTags,
]);

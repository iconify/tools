import type {
	IconifyIcon,
	ExtendedIconifyIcon,
	ExtendedIconifyAlias,
	IconifyOptional,
} from '@iconify/types';

/**
 * Category item
 */
export interface IconCategory {
	title: string;
	// Count is approximate, updated to correct number when exporting icon set
	count: number;
}

/**
 * Get common properties: IconifyOptional + APIIconAttributes
 */
type CommonProps<A, B> = {
	[K in keyof A & keyof B]?: A[K] extends B[K] ? A[K] : never;
};

export type CommonIconProps = CommonProps<
	ExtendedIconifyIcon,
	ExtendedIconifyAlias
>;

/**
 * Exclude IconifyOptional from CommonIconProps
 */
export type ExtraIconProps = Omit<CommonIconProps, keyof IconifyOptional>;

/**
 * Partials
 */
// Characters map
export interface IconWithChars {
	// Characters list
	chars: Set<string>;
}

// Properties
export interface IconWithPropsData extends IconWithChars {
	// Extended icon properties, including 'hidden' status
	props: CommonIconProps;
	// Categories
	categories: Set<IconCategory>;
}

// Parent, used in aliases and variations
export interface IconParentData {
	parent: string;
}

/**
 * Icon types
 */
// Icon
export interface IconSetIcon extends IconWithPropsData {
	type: 'icon';
	body: string;
}

// Simple alias
export interface IconSetIconAlias extends IconWithChars, IconParentData {
	type: 'alias';
}

// Alias with transformations, counts as a new icon
export interface IconSetIconVariation
	extends IconWithPropsData,
		IconParentData {
	type: 'variation';
}

/**
 * All icon types
 */
export type IconSetIconEntry =
	| IconSetIcon
	| IconSetIconAlias
	| IconSetIconVariation;

export type IconSetIconType = IconSetIconEntry['type'];

/**
 * Full icon with extra stuff
 */
export interface ResolvedIconifyIcon extends IconifyIcon, ExtraIconProps {}

/**
 * Result for checking theme: list of names for each theme
 */
export interface CheckThemeResult {
	// Icons that match theme
	valid: Record<string, string[]>;

	// Icons that do not match any theme
	invalid: string[];
}

/**
 * Callback for asyncForEach function
 *
 * Return false to stop loop
 */
type IconSetAsyncForEachCallbackResult = void | false;
export type IconSetAsyncForEachCallback = (
	name: string,
	type: IconSetIconEntry['type']
) =>
	| Promise<IconSetAsyncForEachCallbackResult>
	| IconSetAsyncForEachCallbackResult;

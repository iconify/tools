import {
	commonObjectProps,
	unmergeObjects,
} from '@iconify/utils/lib/misc/objects';
import type { CommonIconProps } from './types';
import { defaultIconProps } from '@iconify/utils';

/**
 * Common properties for icon and alias
 */
export const defaultCommonProps: Required<CommonIconProps> = Object.freeze({
	...defaultIconProps,
	hidden: false,
});

/**
 * Filter icon props: copies properties, removing undefined and default entries
 */
export function filterProps(
	data: CommonIconProps,
	reference: CommonIconProps,
	compareDefaultValues: boolean
): CommonIconProps {
	const result = commonObjectProps(data, reference);
	return compareDefaultValues ? unmergeObjects(result, reference) : result;
}

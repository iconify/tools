import { iconDefaults } from '@iconify/utils/lib/icon';
import type { CommonIconProps, ExtraIconProps } from './types';

/**
 * Default properties
 */
export const extraDefaultProps: Required<ExtraIconProps> = {
	hidden: false,
};

export const defaultCommonProps: Required<CommonIconProps> = {
	...iconDefaults,
	...extraDefaultProps,
};

/**
 * Properties to filter
 */
const props = Object.keys(defaultCommonProps) as (keyof CommonIconProps)[];

/**
 * Filter icon props: copies properties, removing undefined and default entries
 */
export function filterProps(
	data: CommonIconProps,
	compareDefaultValues: boolean
): CommonIconProps {
	const result = {} as CommonIconProps;
	props.forEach((attr) => {
		const value = data[attr];
		if (
			value !== void 0 &&
			(!compareDefaultValues ||
				value !== (defaultCommonProps as Record<string, unknown>)[attr])
		) {
			(result as Record<string, unknown>)[attr] = value;
		}
	});
	return result;
}

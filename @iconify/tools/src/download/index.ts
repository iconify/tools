import {
	downloadGitHubRepo,
	DownloadGitHubRepoOptions,
	DownloadGitHubRepoResult,
} from './github';
import {
	downloadGitRepo,
	DownloadGitRepoOptions,
	DownloadGitRepoResult,
} from './git';
import {
	downloadNPMPackage,
	DownloadNPMPackageOptions,
	DownloadNPMPackageResult,
} from './npm';
import type { DocumentNotModified } from './types/modified';
import type { DownloadSourceMixin, DownloadSourceType } from './types/sources';
import {
	downloadGitLabRepo,
	DownloadGitLabRepoOptions,
	DownloadGitLabRepoResult,
} from './gitlab';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertNever(v: never) {
	//
}

/**
 * Options and result combinations
 */
interface DownloadGitRepo {
	options: DownloadGitRepoOptions & DownloadSourceMixin<'git'>;
	result: DownloadGitRepoResult;
}
interface DownloadGitHubRepo {
	options: DownloadGitHubRepoOptions & DownloadSourceMixin<'github'>;
	result: DownloadGitHubRepoResult;
}
interface DownloadGitLabRepo {
	options: DownloadGitLabRepoOptions & DownloadSourceMixin<'gitlab'>;
	result: DownloadGitLabRepoResult;
}
interface DownloadNPMPackage {
	options: DownloadNPMPackageOptions & DownloadSourceMixin<'npm'>;
	result: DownloadNPMPackageResult;
}

/**
 * Combinations based on type
 */
export type DownloadParamsMixin<T extends DownloadSourceType> = T extends 'git'
	? DownloadGitRepo
	: T extends 'github'
	? DownloadGitHubRepo
	: T extends 'gitlab'
	? DownloadGitLabRepo
	: T extends 'npm'
	? DownloadNPMPackage
	: never;

/**
 * Combinations
 */
export type DownloadParams =
	| DownloadGitRepo
	| DownloadGitHubRepo
	| DownloadGitLabRepo
	| DownloadNPMPackage;

/**
 * Pick options or result from combinations
 */
type DownloadOptions<T extends DownloadSourceType> =
	DownloadParamsMixin<T>['options'];
type DownloadResult<T extends DownloadSourceType> = Promise<
	DocumentNotModified | DownloadParamsMixin<T>['result']
>;

export function downloadPackage<T extends 'git'>(
	options: DownloadOptions<T>
): DownloadResult<T>;
export function downloadPackage<T extends 'github'>(
	options: DownloadOptions<T>
): DownloadResult<T>;
export function downloadPackage<T extends 'gitlab'>(
	options: DownloadOptions<T>
): DownloadResult<T>;
export function downloadPackage<T extends 'npm'>(
	options: DownloadOptions<T>
): DownloadResult<T>;
export function downloadPackage<T extends DownloadSourceType>(
	options: DownloadOptions<T>
): DownloadResult<T> {
	switch (options.downloadType) {
		case 'git':
			return downloadGitRepo(options);

		case 'github':
			return downloadGitHubRepo(options);

		case 'gitlab':
			return downloadGitLabRepo(options);

		case 'npm':
			return downloadNPMPackage(options);

		default:
			assertNever(options);
			throw new Error(
				`Invalid download type: ${
					(options as Record<string, string>).downloadType
				}`
			);
	}
}

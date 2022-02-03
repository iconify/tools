/**
 * Download types
 */
export type DownloadSourceType = 'git' | 'github' | 'gitlab' | 'npm';

/**
 * Type in other objects
 */
export interface DownloadSourceMixin<T extends DownloadSourceType> {
	downloadType: T;
}

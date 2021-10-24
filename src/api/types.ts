/**
 * API Cache
 */
export interface APICacheOptions {
	// Directory where cache should be stored
	dir: string;

	// TTL in seconds
	ttl: number;
}

/**
 * Params
 */
export interface APIQueryParams {
	uri: string;
	params?: URLSearchParams;
	headers?: Record<string, string>;
}

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

/**
 * Query result
 */
interface APIQuerySuccess {
	success: true;

	content: string;
}

interface APIQueryFailure {
	success: false;

	// Response object (if available)
	response?: Response;

	// HTTP error code
	error: number;
}

export type APIQueryResult = APIQuerySuccess | APIQueryFailure;

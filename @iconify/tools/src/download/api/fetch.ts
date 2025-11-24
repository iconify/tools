let customFetch = fetch;

/**
 * Set custom fetch function
 */
export function setFetch(fetchFunction: typeof fetch) {
	customFetch = fetchFunction;
}

/**
 * Get fetch function
 */
export function getFetch(): typeof fetch {
	return customFetch;
}

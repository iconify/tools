/**
 * Concurrent queries limit
 */
let queriesLimit = 5;

/**
 * Concurrent queries retries count
 */
let maxRetries = 3;

/**
 * Set concurrent queries default limit
 */
export function setConcurrentQueriesDefaultLimit(value: number) {
	queriesLimit = value;
}

/**
 * Set concurrent queries default retries count
 */
export function setConcurrentQueriesDefaultRetries(value: number) {
	maxRetries = value;
}

/**
 * Callback to get query
 */
export type GetConcurrentQueryCallback<T> = (index: number) => Promise<T>;

/**
 * Runs concurrent async operations
 */
export function runConcurrentQueries<T>(
	count: number,
	callback: GetConcurrentQueryCallback<T>,
	limit = 0,
	retries = 0
): Promise<T[]> {
	// Set limit and retries count
	limit = Math.max(1, Math.min(limit || queriesLimit, count));
	retries = Math.max(1, retries || maxRetries);

	// Results
	const results: T[] = Array<T>(count).fill(null as unknown as T);

	// Queue
	let nextIndex = 0;
	const resolving = new Set<number>();
	let rejected = false;
	let resolved = false;

	return new Promise((resolve, reject) => {
		// Function to call after item is resolved
		function resolvedItem() {
			if (rejected || resolved) {
				return;
			}

			if (!resolving.size && nextIndex > count) {
				resolved = true;
				resolve(results);
				return;
			}

			if (resolving.size < limit && nextIndex <= count) {
				startNext();
			}
		}

		// Run item
		function run(index: number, retry: number) {
			// Mark as resolving
			resolving.add(index);

			// Get promise and run it
			const p = callback(index);
			p.then((value) => {
				resolving.delete(index);
				results[index] = value;
				resolvedItem();
			}).catch((err) => {
				if (retry < retries) {
					// try again on next tick
					setTimeout(() => {
						run(index, retry + 1);
					});
				} else if (!rejected) {
					rejected = true;
					reject(err);
				}
			});
		}

		// Start next item
		function startNext() {
			// Get next item
			const index = nextIndex++;
			if (index >= count) {
				// Out of queue items
				resolvedItem();
				return;
			}

			// Run query
			run(index, 0);
		}

		// Queue items up to a limit
		for (let i = 0; i < limit; i++) {
			startNext();
		}
	});
}

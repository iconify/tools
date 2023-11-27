/**
 * Default parameters
 */
export const defaultQueueParams: ConcurrentQueriesCommonParams<unknown> = {
	limit: 5,
	retries: 3,
};

/**
 * Callback to get query
 */
export type GetConcurrentQueryCallback<T> = (index: number) => Promise<T>;

/**
 * Parameters
 */
export interface ConcurrentQueriesCommonParams<T> {
	// Number of queries to run at the same time
	limit?: number;

	// Number of retries to attempt
	retries?: number;

	// Callback to run when a Promise fails, contains error message and index of item that caused error
	//
	// If callback is not present, runConcurrentQueries() throws an error.
	//
	// If callback is present, runConcurrentQueries() will not throw an error, it will call
	// callback instead, which should throw an error if runConcurrentQueries() should be aborted
	onFail?: (
		index: number,
		error: unknown,
		params: ConcurrentQueriesParams<T>
	) => void | Promise<void>;
}

export interface ConcurrentQueriesParamsWithCount<T>
	extends ConcurrentQueriesCommonParams<T> {
	total: number;
	callback: (index: number) => Promise<T>;
}

export interface ConcurrentQueriesParamsWithPromises<T>
	extends ConcurrentQueriesCommonParams<T> {
	promises: Promise<T>[];
}

export type ConcurrentQueriesParams<T> =
	| ConcurrentQueriesParamsWithCount<T>
	| ConcurrentQueriesParamsWithPromises<T>;

/**
 * Runs concurrent async operations
 */
export function runConcurrentQueries<T>(
	params: ConcurrentQueriesParams<T>
): Promise<T[]> {
	// Merge with defaults
	const allParams = {
		...defaultQueueParams,
		...params,
	} as ConcurrentQueriesParams<T>;

	// Get type of params
	const paramsWithCount = allParams as ConcurrentQueriesParamsWithCount<T>;
	const paramsWithPromises =
		allParams as ConcurrentQueriesParamsWithPromises<T>;
	const isCallback = typeof paramsWithCount.total === 'number';

	// Get options
	const count = isCallback
		? paramsWithCount.total
		: paramsWithPromises.promises.length;
	const limit = Math.max(1, Math.min(allParams.limit || 1, count));
	const retries = Math.max(1, allParams.retries || 1);

	// Results
	const results: T[] = Array<T>(count).fill(undefined as unknown as T);

	// Queue
	let nextIndex = 0;
	const resolving = new Set<number>();
	let rejected = false;
	let resolved = false;

	return new Promise((resolve, reject) => {
		// Function to call after item is resolved
		function resolvedItem() {
			if (rejected || resolved) {
				// Already resolved/rejected promise
				return;
			}

			if (!resolving.size && nextIndex > count) {
				// All items done
				resolved = true;
				resolve(results);
				return;
			}

			if (resolving.size < limit && nextIndex <= count) {
				// More items in queue
				startNext();
			}
		}

		// Item failed all retries
		function fail(index: number, err: unknown) {
			function done(failed: boolean) {
				// Done: reject or continue to next item
				resolving.delete(index);
				if (failed) {
					rejected = true;
					reject(err);
				} else {
					resolvedItem();
				}
			}

			// check for callback
			if (allParams.onFail) {
				let retry: void | Promise<void>;
				try {
					retry = allParams.onFail(index, err, params);
				} catch (err2) {
					// Callback threw error: use that error
					err = err2;
					done(true);
					return;
				}

				if (retry instanceof Promise) {
					// Callback returned a Promise: wait for it
					retry
						.then(() => {
							done(false);
						})
						.catch((err2) => {
							// Callback threw error: use that error
							err = err2;
							done(true);
						});
					return;
				}

				// Nothing happened: continue
				done(false);
			} else {
				// No callback
				done(true);
			}
		}

		// Run item
		function run(index: number, retry: number) {
			// Mark as resolving
			resolving.add(index);

			// Get promise and run it
			const p = isCallback
				? paramsWithCount.callback(index)
				: paramsWithPromises.promises[index];

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
					fail(index, err);
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

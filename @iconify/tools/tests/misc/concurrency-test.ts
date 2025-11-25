import { runConcurrentQueries } from '../../src/download/api/queue.js';

describe('Testing concurrency', () => {
	test('Simple queue', async () => {
		const tests: Record<string, number> = {
			test1: 2,
			test2: 100,
			test3: 50,
			test4: 1,
		};

		const keys = Object.keys(tests);
		const callbacks: Set<number> = new Set();
		const resolved: Set<number> = new Set();

		const result = await runConcurrentQueries({
			total: keys.length,

			callback: (index) => {
				expect(callbacks.has(index)).toBeFalsy();
				expect(resolved.has(index)).toBeFalsy();

				if (index < 3) {
					// When first 3 items are called, nothing should be resolved
					expect(Array.from(resolved)).toEqual([]);
				}
				if (index === 3) {
					// When 4th item is called, first one should be resolved
					expect(Array.from(resolved)).toEqual([0]);
				}

				const key = keys[index];
				const delay = tests[key];
				return new Promise((resolve) => {
					setTimeout(() => {
						resolved.add(index);
						resolve(delay);
					}, delay);
				});
			},
			limit: 3,
		});

		expect(result).toEqual(Object.values(tests));
	});
});

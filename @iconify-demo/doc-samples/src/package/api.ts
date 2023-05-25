import { sendAPIQuery } from '@iconify/tools';
import type { APICacheOptions } from '@iconify/tools/lib/download/api/types';

// 3 days cache
const ttl = 60 * 60 * 24 * 3;
const dir = 'cache/api';
const options: APICacheOptions = {
	dir,
	ttl,
};

(async () => {
	const data = await sendAPIQuery(
		{
			uri: 'https://api.iconify.design/collections',
		},
		options
	);
	console.log(typeof data === 'string' ? JSON.parse(data) : data);
})();

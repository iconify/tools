import { getNPMVersion } from '@iconify/tools';

(async () => {
	console.log(
		await getNPMVersion({
			package: '@iconify-json/mdi-light',
			// tag: 'latest',
		})
	);
})();

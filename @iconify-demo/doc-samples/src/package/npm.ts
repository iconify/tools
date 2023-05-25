import { downloadNPMPackage } from '@iconify/tools';

(async () => {
	console.log(
		await downloadNPMPackage({
			target: 'downloads/icon-sets/mdi-light',
			package: '@iconify-json/mdi-light',
		})
	);
})();

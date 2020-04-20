### Example using icon 'sampleFilename' with Vue

This example is using object syntax.

```vue
<template>
	<iconify-icon :icon="icons.sampleIconName" />
</template>

<script>
import IconifyIcon from '@iconify/vue';
import sampleIconName from 'packageName/sampleFilename';

export default {
	components: {
		IconifyIcon,
	},
	data() {
		return {
			icons: {
				sampleIconName,
			},
		};
	},
};
</script>
```

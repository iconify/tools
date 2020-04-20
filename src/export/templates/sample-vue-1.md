### Example using icon 'sampleFilename' with Vue

This example is using string syntax.

```vue
<template>
	<p>
		Example of 'sampleFilename' icon:
		<iconify-icon icon="sampleIconShortName" :inline="true" />!
	</p>
</template>

<script>
import IconifyIcon from '@iconify/vue';
import sampleIconName from 'packageName/sampleFilename';

IconifyIcon.addIcon('sampleIconShortName', sampleIconName);

export default {
	components: {
		IconifyIcon,
	},
};
</script>
```

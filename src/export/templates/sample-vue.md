### Example using icon 'sampleFilename' with Vue

```vue
<template>
	<p>
		<iconify-icon :icon="icons.sampleIconShortName" />
	</p>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import IconifyIcon from '@iconify/vue';
import sampleIconName from 'packageName/sampleFilename';

export default Vue.extend({
	components: {
		IconifyIcon,
	},
	data() {
		return {
			icons: {
				sampleIconShortName: sampleIconName,
			},
		};
	},
});
</script>
```

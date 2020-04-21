### Example using icon 'sampleFilename' with React

This example is using string syntax that is available since Iconify for React 2.0

This example will not work with Iconify for React 1.x

```jsx
import React from 'react';
import { Icon, addIcon } from '@iconify/react';
import sampleIconName from 'packageName/sampleFilename';

addIcon('sampleIconShortName', sampleIconName);

export function MyComponent() {
	return (
		<div>
			<Icon icon="sampleIconShortName" />
		</div>
	);
}
```

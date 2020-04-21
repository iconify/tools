### Example using icon 'sampleFilename' with React

```jsx
import React from 'react';
import { InlineIcon } from '@iconify/react';
import sampleIconName from 'packageName/sampleFilename';

export function MyComponent() {
	return (
		<p>
			<InlineIcon icon={sampleIconName} /> Sample text with an icon.
		</p>
	);
}
```

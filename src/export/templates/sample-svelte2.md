### Example using icon 'sampleFilename' with Svelte

Most Markdown parsers do not highlight Svelte syntax, so this example splits script and template into 2 sections to highlight syntax.

```js
import IconifyIcon from '@iconify/svelte';
import sampleIconName from 'packageName/sampleFilename';
```

```jsx
<IconifyIcon icon={sampleIconName} />
<p>This is some text with icon adjusted for baseline: <IconifyIcon icon={sampleIconName} inline={true} /></p>
```

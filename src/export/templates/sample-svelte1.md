### Example using icon 'sampleFilename' with Svelte

This example shows how to use stylesheet with Svelte component.

```svelte
<script>
    // npm install --save-dev @iconify/svelte packageName
    import IconifyIcon from '@iconify/svelte';
    import sampleIconName from 'packageName/sampleFilename';
</script>
<style>
   /*
       Cannot target component in CSS, target SVG
       instead using Svelte's :global() function
   */
   div :global(svg) {
       vertical-align: -0.125em;
   }
</style>

<IconifyIcon icon={sampleIconName} />
```

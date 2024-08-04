<template>
	<div>
		<div class="text-5xl fw100">unocss test</div>

		<p class="flex">
			<span class="mr-1">Icon imported from `@iconify-json/carbon`:</span>
			<a
				class="i-carbon-logo-github text-blue-600 hover:text-red-600 icon24 inline-icon"
				href="https://github.com/unocss/unocss"
				target="_blank"
			></a>
		</p>

		<p class="flex">
			<span class="mr-1">Icon imported from `test.json`:</span>
			<a
				class="i-test-github text-blue-600 hover:text-red-600 icon24 inline-icon"
				href="https://github.com/unocss/unocss"
				target="_blank"
			></a>
		</p>

		<p class="flex">
			<span class="mr-1">Icons imported from SVG files:</span>
			<span
				class="i-custom-svg:loading text-blue-600 hover:text-red-600 icon24 inline-icon"
			></span>
			<span
				class="i-custom-svg:loading2 text-blue-600 hover:text-red-600 icon24 inline-icon"
			></span>
		</p>
	</div>
</template>

<style>
#app {
	font-family: 'PT Sans', 'Open Sans', sans-serif;
	font-size: 16px;
	line-height: 1.5em;
	padding: 8px;
}
</style>

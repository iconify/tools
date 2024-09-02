<script setup lang="ts">
import LoadingIcon from '~icons/svg-animated/loading';
import LoadingIcon2 from '~icons/svg-animated/loading2';
import BuildIcon from '~icons/svg-ion/build';
import AccessibilityIcon from '~icons/svg-ion/accessibility';
</script>
<template>
	<main>
		<h1>Unplugin Icons demo</h1>
		<p>
			Custom icons with `svg-ion` prefix:
			<BuildIcon /><AccessibilityIcon />
		</p>
		<p>Custom animated icons: <LoadingIcon /><LoadingIcon2 /></p>
		<p>Icons use text color, hover icon to see color change</p>
	</main>
</template>

<style>
main {
	font-size: 16px;
	line-height: 1.5;
}
h1 {
	font-size: 22px;
}
p {
	font: inherit;
}
p svg {
	vertical-align: -0.25em;
}
p:hover {
	color: rgb(8, 98, 172);
}
p svg:hover {
	color: rgb(211, 15, 15);
}
</style>

import { c as create_ssr_component, a as spread, b as escape_object, v as validate_component } from "../../chunks/index-db948222.js";
const Accessibility = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg${spread([
    { xmlns: "http://www.w3.org/2000/svg" },
    { width: "1em" },
    { height: "1em" },
    { preserveAspectRatio: "xMidYMid meet" },
    { viewBox: "0 0 512 512" },
    escape_object($$props)
  ], {})}><!-- HTML_TAG_START -->${`<path fill="currentColor" d="M256 112a56 56 0 1 1 56-56a56.06 56.06 0 0 1-56 56Z"/><path fill="currentColor" d="m432 112.8l-.45.12l-.42.13c-1 .28-2 .58-3 .89c-18.61 5.46-108.93 30.92-172.56 30.92c-59.13 0-141.28-22-167.56-29.47a73.79 73.79 0 0 0-8-2.58c-19-5-32 14.3-32 31.94c0 17.47 15.7 25.79 31.55 31.76v.28l95.22 29.74c9.73 3.73 12.33 7.54 13.6 10.84c4.13 10.59.83 31.56-.34 38.88l-5.8 45l-32.19 176.19q-.15.72-.27 1.47l-.23 1.27c-2.32 16.15 9.54 31.82 32 31.82c19.6 0 28.25-13.53 32-31.94s28-157.57 42-157.57s42.84 157.57 42.84 157.57c3.75 18.41 12.4 31.94 32 31.94c22.52 0 34.38-15.74 32-31.94a57.17 57.17 0 0 0-.76-4.06L329 301.27l-5.79-45c-4.19-26.21-.82-34.87.32-36.9a1.09 1.09 0 0 0 .08-.15c1.08-2 6-6.48 17.48-10.79l89.28-31.21a16.9 16.9 0 0 0 1.62-.52c16-6 32-14.3 32-31.93S451 107.81 432 112.8Z"/>`}<!-- HTML_TAG_END --></svg>`;
});
const Balloon_outline = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg${spread([
    { xmlns: "http://www.w3.org/2000/svg" },
    { width: "1em" },
    { height: "1em" },
    { preserveAspectRatio: "xMidYMid meet" },
    { viewBox: "0 0 512 512" },
    escape_object($$props)
  ], {})}><!-- HTML_TAG_START -->${`<path fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32" d="M414.11 153.82C429.66 264.4 345.85 357.09 282.54 366s-169.48-57.5-185-167.68a159.82 159.82 0 1 1 316.53-44.49Z"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M236.06 308.05c-32.83-13-67.08-43.1-82.27-85.46M367.7 495.78c-32.83-13-63.31-40.06-78.5-82.41"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="m266.71 368.21l-9.17 49.61l63.31-8.9l-22.49-45.16l-31.65 4.45z"/>`}<!-- HTML_TAG_END --></svg>`;
});
var index_svelte_svelte_type_style_lang = "";
const css = {
  code: "main.svelte-1vxel7t.svelte-1vxel7t{text-align:left;font-size:16px;line-height:24px}section.svelte-1vxel7t.svelte-1vxel7t{border:1px solid #ccc;background:#f2f2f2;color:#313131;margin:8px;padding:8px;transition:color 0.2s ease}section.svelte-1vxel7t:hover p.svelte-1vxel7t{color:#026c9c}section.svelte-1vxel7t h1.svelte-1vxel7t{font-size:24px;line-height:32px;margin:0 0 16px;padding:0}p.svelte-1vxel7t.svelte-1vxel7t{margin:8px 0;padding:0}",
  map: null
};
const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<main class="${"svelte-1vxel7t"}"><section class="${"svelte-1vxel7t"}"><h1 class="${"svelte-1vxel7t"}">Importing from 512x512 monotone SVG</h1>
        <p class="${"svelte-1vxel7t"}">Black 1em icon, changes color on hover: ${validate_component(Accessibility, "SVGIonAccessibility").$$render($$result, {}, {}, {})}</p>
        <p class="${"svelte-1vxel7t"}">Green 2em icon: ${validate_component(Balloon_outline, "SVGIonBalloonOutline").$$render($$result, { style: "font-size: 2em; color: #327335;" }, {}, {})}</p></section>
</main>`;
});
export { Routes as default };

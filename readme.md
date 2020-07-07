# Iconify Tools demo

This example shows how to convert directory full of SVG files to Iconify JSON format.

As a source, this demo uses FontAwesome Pro icons from [FortAwesome/Font-Awesome-Pro](https://github.com/FortAwesome/Font-Awesome-Pro) repository.

If you do not have access to that repository, unpack FontAwesome Pro in this directory (make sure `svgs` directory is one level deep, for example `FontAwesomePro/svgs/`). Script should be able to locate files.

Process:

- Install dependencies: `npm install`.
- Run build script: `npm run build`.
- Multiple `fa-pro-*.json` files will appear.

See `convert-fa-pro.js` for source code.

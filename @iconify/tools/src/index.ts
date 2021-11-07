// SVG class and functions
export { SVG } from './svg/index';
export { parseSVG } from './svg/parse';
export { parseSVGStyle } from './svg/parse-style';

// SVG cleanup
export { cleanupSVG } from './svg/cleanup';
export { removeBadAttributes } from './svg/cleanup/attribs';
export { checkBadTags } from './svg/cleanup/bad-tags';
export { cleanupInlineStyle } from './svg/cleanup/inline-style';
export { cleanupSVGRoot } from './svg/cleanup/root-svg';
export { convertStyleToAttrs } from './svg/cleanup/svgo-style';

// IconSet class
export { IconSet, blankIconSet } from './icon-set/index';
export { mergeIconSets } from './icon-set/merge';

// Import
export { importFromFigma } from './import/figma/index';
export { importDirectory } from './import/directory';

// Download (for import)
export { downloadGitRepo } from './download/git/index';
export { getGitRepoHash } from './download/git/hash';
export { downloadGitHubRepo } from './download/github/index';
export { getGitHubRepoHash } from './download/github/hash';
export { downloadNPMPackage } from './download/npm/index';
export { getNPMVersion, getPackageVersion } from './download/npm/version';

// Manipulation
export { parseColors, isEmptyColor } from './colors/parse';
export { runSVGO } from './optimise/svgo';
export { deOptimisePaths } from './optimise/flags';
export { scaleSVG } from './optimise/scale';

// Export
export { exportToDirectory } from './export/directory';
export { exportIconPackage } from './export/icon-package';
export { exportJSONPackage } from './export/json-package';

// Misc
export { execAsync } from './misc/exec';
export { cleanupIconKeyword } from './misc/keyword';
export { scanDirectory } from './misc/scan';
export { writeJSONFile } from './misc/write-json';
export { bumpVersion } from './misc/bump-version';
export { compareDirectories } from './misc/compare-dirs';
export { sendAPIQuery } from './download/api/index';
export { prepareDirectoryForExport } from './export/helpers/prepare';

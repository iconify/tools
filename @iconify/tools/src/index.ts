// SVG class and functions
export { SVG } from './svg/index';
export { parseSVG } from './svg/parse';
export { parseSVGStyle } from './svg/parse-style';
export { analyseSVGStructure } from './svg/analyse';

// SVG cleanup
export { cleanupSVG } from './svg/cleanup';
export { removeBadAttributes } from './svg/cleanup/attribs';
export { checkBadTags } from './svg/cleanup/bad-tags';
export { cleanupRootStyle } from './svg/cleanup/root-style';
export { cleanupInlineStyle } from './svg/cleanup/inline-style';
export { cleanupSVGRoot } from './svg/cleanup/root-svg';
export { convertStyleToAttrs } from './svg/cleanup/svgo-style';

// IconSet class
export { IconSet, blankIconSet } from './icon-set/index';
export { mergeIconSets } from './icon-set/merge';
export { addTagsToIconSet } from './icon-set/tags';

// Import
export { importFromFigma } from './import/figma/index';
export { importDirectory } from './import/directory';

// Download (for import)
export { downloadGitRepo } from './download/git/index';
export { getGitRepoHash } from './download/git/hash';
export { getGitRepoBranch } from './download/git/branch';
export { resetGitRepoContents } from './download/git/reset';
export { downloadGitHubRepo } from './download/github/index';
export { getGitHubRepoHash } from './download/github/hash';
export { downloadGitLabRepo } from './download/gitlab/index';
export { getGitLabRepoHash } from './download/gitlab/hash';
export { downloadNPMPackage } from './download/npm/index';
export { getNPMVersion, getPackageVersion } from './download/npm/version';
export { downloadPackage } from './download/index';
export { downloadFile } from './download/api/download';

// Manipulation
export { parseColors, isEmptyColor } from './colors/parse';
export { validateColors } from './colors/validate';
export { detectIconSetPalette } from './colors/detect';
export { runSVGO } from './optimise/svgo';
export { deOptimisePaths } from './optimise/flags';
export { scaleSVG } from './optimise/scale';
export { cleanupGlobalStyle } from './optimise/global-style';

// Export
export { exportToDirectory } from './export/directory';
export { exportIconPackage } from './export/icon-package';
export { exportJSONPackage } from './export/json-package';

// Misc: files, directories and archives
export { writeJSONFile } from './misc/write-json';
export { prepareDirectoryForExport } from './export/helpers/prepare';
export { scanDirectory } from './misc/scan';
export { compareDirectories } from './misc/compare-dirs';
export { unzip } from './download/helpers/unzip';
export { untar } from './download/helpers/untar';

// Misc: other
export { execAsync } from './misc/exec';
export { cleanupIconKeyword } from './misc/keyword';
export { bumpVersion } from './misc/bump-version';
export { sendAPIQuery } from './download/api/index';

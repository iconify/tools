// SVG class and functions
export { SVG } from './svg/index.js';
export { parseSVG } from './svg/parse.js';
export { parseSVGStyle } from './svg/parse-style.js';
export { analyseSVGStructure } from './svg/analyse.js';

// SVG cleanup
export { cleanupSVG } from './svg/cleanup.js';
export { removeBadAttributes } from './svg/cleanup/attribs.js';
export { checkBadTags } from './svg/cleanup/bad-tags.js';
export { cleanupRootStyle } from './svg/cleanup/root-style.js';
export { cleanupInlineStyle } from './svg/cleanup/inline-style.js';
export { cleanupSVGRoot } from './svg/cleanup/root-svg.js';
export { convertStyleToAttrs } from './svg/cleanup/svgo-style.js';

// IconSet class
export { IconSet, blankIconSet } from './icon-set/index.js';
export { mergeIconSets } from './icon-set/merge.js';
export { addTagsToIconSet } from './icon-set/tags.js';

// Import
export { importFromFigma } from './import/figma/index.js';
export { importDirectory, importDirectorySync } from './import/directory.js';

// Download (for import)
export { downloadGitRepo } from './download/git/index.js';
export { getGitRepoHash } from './download/git/hash.js';
export { getGitRepoBranch } from './download/git/branch.js';
export { resetGitRepoContents } from './download/git/reset.js';
export { downloadGitHubRepo } from './download/github/index.js';
export { getGitHubRepoHash } from './download/github/hash.js';
export { downloadGitLabRepo } from './download/gitlab/index.js';
export { getGitLabRepoHash } from './download/gitlab/hash.js';
export { downloadNPMPackage } from './download/npm/index.js';
export { getNPMVersion, getPackageVersion } from './download/npm/version.js';
export { downloadPackage } from './download/index.js';
export { downloadFile } from './download/api/download.js';

// Manipulation
export { parseColors, isEmptyColor } from './colors/parse.js';
export { validateColors } from './colors/validate.js';
export { detectIconSetPalette } from './colors/detect.js';
export { runSVGO } from './optimise/svgo.js';
export { removeFigmaClipPathFromSVG } from './optimise/figma.js';
export { deOptimisePaths } from './optimise/flags.js';
export { resetSVGOrigin } from './optimise/origin.js';
export { convertSVGToMask } from './optimise/mask.js';
export { scaleSVG } from './optimise/scale.js';
export { cleanupGlobalStyle } from './optimise/global-style.js';

// Export
export { exportToDirectory } from './export/directory.js';
export { exportJSONPackage } from './export/json-package.js';
export { exportIconPackage } from './export/icon-package.js';

// Misc: files, directories and archives
export { writeJSONFile } from './misc/write-json.js';
export { prepareDirectoryForExport } from './export/helpers/prepare.js';
export { scanDirectory, scanDirectorySync } from './misc/scan.js';
export { compareDirectories } from './misc/compare-dirs.js';
export { unzip } from './download/helpers/unzip.js';
export { untar } from './download/helpers/untar.js';

// Misc: other
export { execAsync } from './misc/exec.js';
export { cleanupIconKeyword } from './misc/keyword.js';
export { bumpVersion } from './misc/bump-version.js';
export { axiosConfig, fetchCallbacks } from './download/api/config.js';
export { setFetch } from './download/api/fetch.js';
export { sendAPIQuery } from './download/api/index.js';
export { runConcurrentQueries, defaultQueueParams } from './download/api/queue.js';

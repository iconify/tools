# Contribution Guide

## Reporting a bug

If you have found a bug, please [create an issue on GitHub](https://github.com/iconify/tools/issues).

Please include the following:

-   A concise description of the bug.
-   Version of Iconify Tools, Node.js
-   Is possible, reduced test case. It can be a small piece of code or link to a repository.
-   Any other information that you think might help fix that bug.

## Development

This repository uses `pnpm` to manage dependencies and workspaces.

It is recommended that you use [@antfu/ni](https://github.com/antfu/ni), then you don't need to worry if project you are working on uses `npm`, `pnpm`, `yarn` or something else: all commands will be identical regardless of package manager.

### Branches

There are two main branches:

-   `main` that contains latest stable code.
-   `next` that contains development code.

If you want to create a pull request, base your new branch off `next` branch and create a pull request for `next` branch.

If you are having issues with `next` branch, using `main` branch is also fine, though `next` is preferred.

### Installation

Clone repository, run `ni` to install all dependencies.

### Directory structure

This repository contains several packages:

-   `@iconify/tools` directory contains main package.
-   `@iconify-demo` directory contains various packages used for demo.

#### Tools directory

For most use cases, everything you need is in directory `@iconify/tools`:

-   Source code is in sub-directory `src`.
-   Unit tests are in directory `tests`.

### Building and testing

To build Iconify Tools, run `nr build`.

To test code, run `nr test`. Make sure you build package before testing.

You can run these commands from either root directory or from `@iconify/tools` sub-directory. If you run them from root directory, it will be ran for all packages. If you run them from `@iconify/tools` sub-directory, it will be ran only for Iconify Tools.

### Making a pull request

To create a pull request, please following these steps:

1. Fork this repository.
2. In your forked repository, create a new branch based on `next` branch, such as `git checkout -b dev/my-fix next`.
3. Install dependencies: `ni`.
4. Update code.
5. Build it: `nr build`.
6. Test it: `nr test`.
7. Commit changes: `git add -A`, `git commit -m "chore: short description"` (change commit message).
8. Push changes: `git push origin dev/my-fix` (change branch name).
9. On GitHub, send a pull request from your branch to `next` branch.

If you have never contributed to a project before, do not worry about making mistakes.
You can ask for help in an issue on GitHub or on Iconify Discord.

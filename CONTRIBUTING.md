# Contributing

Thanks for your interest in contributing to `highlightjs-verse`!

## Development Setup

```bash
git clone https://github.com/abdelrahman-mohammad/highlightjs-verse.git
cd highlightjs-verse
npm install
```

## Scripts

| Command | Description |
|---|---|
| `npm test` | Run the test suite |
| `npm run build` | Build the dist files |

## Making Changes

1. Fork the repo and create a branch from `main`.
2. Edit the grammar in `src/languages/verse.js`.
3. Add or update tests in `test/verse.test.js`.
4. Run `npm test` to make sure all tests pass.
5. Run `npm run build` to regenerate the dist files.
6. Open a pull request.

## Grammar

The grammar is a [highlight.js language definition](https://highlightjs.readthedocs.io/en/latest/language-guide.html) based on Epic Games' TextMate grammar for Verse. Scope-to-color mappings are documented at the top of `src/languages/verse.js`.

## Theme

The `verse-dark` theme in `styles/verse-dark.css` uses colors from Epic Games' official VS Code Verse extension. If you're adding new token types, make sure to add corresponding CSS rules.

## Releases

Releases are automated via GitHub Actions. When a new GitHub Release is created with a `v*` tag, the package is automatically published to npm.

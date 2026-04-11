# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.1.0] - 2026-04-11

### Added

- Nine additional Verse specifiers recognized as keywords, closing drift against the Verse language reference:
  - Memory effects: `reads`, `writes`, `allocates` (note: `<allocates>` is required on `<unique>` classes as of UEFN 31.00)
  - Class modifiers: `castable`, `final_super`, `persistable`
  - Access: `scoped`
  - Function attributes: `localizes`
  - Interop: `native_callable`
- Regression tests ensuring `final_super` and `native_callable` do not collide with their shorter prefixes (`final`, `native`).

## [1.0.0] - 2026-04-07

### Added

- Verse language grammar for highlight.js with 13 token rules
- `verse-dark` theme with colors from Epic Games' official VS Code Verse extension
- CJS, ESM, and IIFE (browser) builds
- 33 tests covering all token types
- GitHub Actions CI (Node 18/20/22) and automated npm release workflow

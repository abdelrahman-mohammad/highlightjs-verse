# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.3.0] - 2026-09-20

### Added

- Block macros `if for loop block case defer spawn race sync rush branch let batch first assert` are highlighted as block keywords (slate blue, with `then`, `else` and `do`). `if (X > 1):` and `for (Y := 0..3):` no longer render `if` and `for` as function names. ([#11])
- Built-in types `int float string void char logic any comparable tuple rational array map option` are highlighted as types. ([#11])
- Seven specifiers from Epic's shipped digests: `constructor`, `predicts`, `open`, `final_super_base`, `persistent`, `module_scoped_var_weak_map_key`, `uht_comparable`. ([#11])

## [1.2.1] - 2026-09-20

### Fixed

- `<#>` no longer opens a block comment that runs to the end of the file. It is Verse's indented comment marker: the rest of its line and every line indented past it are comment, and the first dedented line is code again. A `<#>` written inside a `<# ... #>` block no longer ends that block either. ([#10])

## [1.2.0] - 2026-04-11

### Added

- TypeScript type definitions shipped with the package. Consumers no longer need a local ambient module declaration.

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

[Unreleased]: https://github.com/abdelrahman-mohammad/highlightjs-verse/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/abdelrahman-mohammad/highlightjs-verse/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/abdelrahman-mohammad/highlightjs-verse/compare/v1.2.0...v1.2.1

[#10]: https://github.com/abdelrahman-mohammad/highlightjs-verse/issues/10
[#11]: https://github.com/abdelrahman-mohammad/highlightjs-verse/issues/11

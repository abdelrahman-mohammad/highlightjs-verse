---
name: sync-verse-grammar
description: Use when the user wants to update, sync, or refresh the highlightjs-verse package to match a new version of Epic's Verse VS Code extension (epicgames.verse), mentions that Verse keywords/operators/specifiers/colors have drifted from the official grammar, asks how to add a newly-shipped Verse language feature to the highlighter, or asks to cut a new release of highlightjs-verse to npm. Covers the upstream-to-dist sync loop specific to the d:/UEFN/Scripts/highlightjs-verse repo.
---

# Sync Verse Grammar

Mirror changes from Epic's official Verse VS Code extension into the `highlightjs-verse` npm package, rebuild, and release.

## When to use this skill

- User says "Epic pushed a new Verse extension", "the grammar is out of date", "add the new `<foo>` keyword", "Verse added X, update the highlighter"
- User asks to release / publish / bump version of `highlightjs-verse`
- User notices miscolored tokens in Verse code rendered with this package and wants to fix them to match the official theme
- User wants to add a new token type or CSS rule to match an upstream theme change

**Do NOT use** for: generic highlight.js grammar questions unrelated to Verse, or changes to unrelated packages.

## Source of truth

The repo tracks **Epic Games' VS Code extension `epicgames.verse`** — specifically two files inside the extension:

1. `verse.json` — TextMate grammar (drives [src/languages/verse.js](src/languages/verse.js))
2. `verse-dark.tmTheme.json` — color theme (drives [styles/verse-dark.css](styles/verse-dark.css))

Both are the authoritative inputs. If the user hasn't already diffed them, ask where the new versions are (local VS Code install under `~/.vscode/extensions/epicgames.verse-*/`, or the extension marketplace VSIX).

## Workflow

### 1. Diff the upstream grammar

Pull the latest `verse.json` and `verse-dark.tmTheme.json` from the updated extension. Diff against whatever version the repo was last synced to. Focus on:

- New entries under `keyword.control`, `keyword.declaration`, `keyword.operator.logical`
- New class/effect/visibility specifiers (these are the ones most likely to drift — see Gotchas)
- Changes to regex patterns for numbers, paths, escapes, char literals
- New scopes that don't yet have a mapping

### 2. Update the grammar

Edit [src/languages/verse.js](src/languages/verse.js). The file has a scope → hljs-class mapping table in the header comment (lines 1-21) — **keep that table honest** when you touch anything.

Hotspots ordered by drift likelihood:

1. **`TYPE_SPECIFIER` regex** (around line 135) — a hardcoded alternation of `class|struct|interface|enum|module|trait|unique|abstract|concrete|final|internal|public|private|protected|override|transacts|varies|computes|converges|decides|no_rollback|suspends|native|epic_internal`. These are _not_ separate scopes in Epic's grammar (they're plain identifiers), but the package surfaces them as keywords for readability. **Any new effect specifier or visibility modifier Epic ships must be added here manually** — nothing else will catch it.
2. **`KEYWORDS` object** (around line 29) — `keyword` / `built_in` / `type` / `literal` buckets. Map new control keywords to `keyword`, declaration-like keywords to `built_in` or `type`, true/false-style literals to `literal`.
3. **`OPERATOR` regex** — if Epic introduces new operator glyphs (e.g. a new arrow form).
4. **`ESCAPE`, `NUMBER`, `PATH`, `CHAR_LITERAL`** — only touch if upstream regexes changed.

### 3. Update the theme

Edit [styles/verse-dark.css](styles/verse-dark.css). Colors come from `verse-dark.tmTheme.json`. Rules:

- Match hex values **exactly** to the upstream theme.
- If a new token scope is introduced in step 2, add a matching `.hljs-<class>` rule.
- Selectors like `.hljs-char\.escape` and `.hljs-title\.function` use backslash-escaped dots — hljs v11 naming convention. Don't "fix" them.
- Keep `.hljs { background: transparent; }` — consumers style their own backgrounds.

### 4. Update tests

Add or update cases in [test/verse.test.js](test/verse.test.js) covering every new keyword / specifier / token you added. Then:

```bash
npm test
```

### 5. Rebuild dist

```bash
npm run build
```

This runs [build.mjs](build.mjs), which emits two targets via esbuild:

- `dist/verse.es.min.js` — ESM for bundlers
- `dist/verse.min.js` — IIFE with auto-registration footer for `<script>` tags

`prepublishOnly` also invokes this, but run it manually so you can inspect the diff before committing.

### 6. Update changelog and version

- Bump `version` in [package.json](package.json) following semver:
    - **patch** — bug fix, color tweak, no new scopes
    - **minor** — new keywords/tokens, backwards-compatible CSS additions
    - **major** — scope renames, removed CSS classes, peer-dep bump, or anything that could break downstream themes
- Add an entry to [CHANGELOG.md](CHANGELOG.md) matching the existing format.

### 7. Commit, tag, release

```bash
git add -A
git commit -m "feat: sync grammar with verse extension vX.Y"
git tag vX.Y.Z
git push origin main --tags
```

Then create a **GitHub Release** from the `vX.Y.Z` tag. The release workflow auto-publishes to npm via OIDC trusted publishing — no `NPM_TOKEN` secret involved (see commits `428ea51` / `1f16790` in history).

The existing `release` skill automates steps 6-7 if available — prefer it over doing this by hand.

## Gotchas

- **`TYPE_SPECIFIER` is the #1 drift source.** Epic keeps adding effect specifiers (`transacts`, `suspends`, `decides`, `varies`, `computes`, `converges`, `no_rollback`, `epic_internal`) and visibility modifiers. They are not scopes in the TextMate grammar, so a naive "diff the scopes" pass will miss them. Manually scan the Verse language reference's effects and modifiers lists.
- **highlight.js peer dep is `>=11.0.0`.** Scope names (`title.function`, `char.escape`, `punctuation`, `subst`) follow hljs v11 conventions. If hljs ever renames scopes in a future major, both the grammar scopes _and_ the escaped-dot CSS selectors must move together.
- **OIDC trusted publishing.** The GitHub → npm publish path depends on the repo being registered as a trusted publisher on npmjs.com. If that link is broken (e.g. repo renamed, org changed), releases will fail with an opaque auth error. Check npm's trusted-publisher config first before debugging the workflow.
- **No automated upstream watcher.** Nothing monitors the `epicgames.verse` marketplace page. Upstream drift is only noticed when a user reports it. If the user wants this automated, a scheduled GitHub Action that downloads the VSIX and diffs `verse.json` is the right place — don't put that logic in the package itself.
- **`case_insensitive: false`.** Verse is case-sensitive. Don't flip this even if it "fixes" a matching issue — you're probably missing a keyword, not a case bug.
- **The line-comment regex uses a lookbehind `(?<!<)#(?!>)`** to avoid eating the `<#`/`#>` block comment delimiters. If you rewrite it, test nested block comments specifically — they're the usual regression site.
- **Don't create empty `styles/*` or `dist/*` files on a branch.** `package.json` lists `dist/` in `files`, so stray empty files get shipped to npm.

## Files you will almost always touch

- [src/languages/verse.js](src/languages/verse.js) — grammar
- [styles/verse-dark.css](styles/verse-dark.css) — theme
- [test/verse.test.js](test/verse.test.js) — tests
- [package.json](package.json) — version bump
- [CHANGELOG.md](CHANGELOG.md) — release notes

## Files you should rarely touch

- [build.mjs](build.mjs) — only if adding a new output target
- `.github/workflows/*` — only if the release path itself is changing
- [README.md](README.md) — only if the public API or install instructions change

## Validation checklist before tagging

- [ ] `npm test` passes with new test cases covering every added keyword/specifier
- [ ] `npm run build` succeeds and `dist/` files are regenerated
- [ ] Scope → hljs-class table in the header of `src/languages/verse.js` still matches reality
- [ ] Every new `.hljs-*` selector in `styles/verse-dark.css` has a corresponding scope in the grammar (and vice versa)
- [ ] `CHANGELOG.md` and `package.json` version are in sync
- [ ] Tag matches `v<package.json version>` exactly (release workflow filters on `v*`)

# highlightjs-verse

[![npm version](https://img.shields.io/npm/v/highlightjs-verse.svg)](https://www.npmjs.com/package/highlightjs-verse)
[![CI](https://github.com/abdelrahman-mohammad/highlightjs-verse/actions/workflows/ci.yml/badge.svg)](https://github.com/abdelrahman-mohammad/highlightjs-verse/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Verse](https://dev.epicgames.com/documentation/en-us/uefn/verse-language-reference) language grammar and theme for [highlight.js](https://highlightjs.org/).

Verse is the programming language for [Unreal Editor for Fortnite (UEFN)](https://dev.epicgames.com/documentation/en-us/uefn/unreal-editor-for-fortnite-documentation) by Epic Games. This package adds Verse syntax highlighting support to highlight.js with colors matching Epic's official VS Code extension.

## Install

```bash
npm install highlightjs-verse highlight.js
```

## Usage

### ES Modules (React, Vue, Vite, webpack)

```js
import hljs from 'highlight.js/lib/core';
import verse from 'highlightjs-verse';
import 'highlightjs-verse/styles/verse-dark.css';

hljs.registerLanguage('verse', verse);

// Highlight a code string
const result = hljs.highlight(code, { language: 'verse' });

// Or highlight a DOM element
hljs.highlightElement(document.querySelector('code'));
```

### CommonJS (Node.js, SSR)

```js
const hljs = require('highlight.js/lib/core');
const verse = require('highlightjs-verse');

hljs.registerLanguage('verse', verse);

// Server-side render highlighted HTML
const html = hljs.highlight(verseCode, { language: 'verse' }).value;
```

### Browser / CDN

```html
<!-- highlight.js core -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11/styles/default.min.css">
<script src="https://cdn.jsdelivr.net/npm/highlight.js@11/highlight.min.js"></script>

<!-- Verse support (auto-registers, no extra JS needed) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlightjs-verse@1/styles/verse-dark.css">
<script src="https://cdn.jsdelivr.net/npm/highlightjs-verse@1/dist/verse.min.js"></script>
```

The browser build auto-registers the language — just include the script and go:

```html
<pre><code class="language-verse">
MyDevice := class(creative_device):
    @editable
    Greeting : string = "Hello, Verse!"

    OnBegin<override>()<suspends> : void =
        Print(Greeting)
</code></pre>
```

### Markdown renderers

Works with any markdown renderer that supports highlight.js (markdown-it, marked, rehype, etc.):

```js
import markdownit from 'markdown-it';
import hljs from 'highlight.js/lib/core';
import verse from 'highlightjs-verse';

hljs.registerLanguage('verse', verse);

const md = markdownit({
    highlight: (str, lang) => {
        if (lang === 'verse') {
            return hljs.highlight(str, { language: 'verse' }).value;
        }
        return '';
    }
});
```

Now ` ```verse ` code fences in markdown are syntax highlighted.

## What Gets Highlighted

| Token | Examples | Color |
|---|---|---|
| Block comments | `<# nested #>` | Green `#77B06B` |
| Line comments | `# comment` | Green `#77B06B` |
| Strings | `"Hello {Name}"` | Tan `#C09077` |
| String interpolation | `{expr}` inside strings | Gold `#B89047` |
| Escape sequences | `\n`, `\t`, `\"` | Gold `#B89047` |
| Numbers | `42`, `0xFF`, `3.14e2` | Light green `#c2ddb4` |
| Control keywords | `return`, `yield`, `break` | Blue `#569cd6` |
| Block keywords | `with`, `do`, `then`, `else` | Slate blue `#8499b7` |
| Declaration keywords | `var`, `set`, `ref`, `in` | Slate blue `#8499b7` |
| Type specifiers | `class`, `struct`, `interface` | Blue `#569cd6` |
| Operators | `+`, `->`, `=>`, `:=` | Teal `#77AFAF` |
| Logical operators | `and`, `or`, `not` | Teal `#77AFAF` |
| Functions/definitions | `MyFunc(...)`, `Name : type` | Purple `#e5c2ff` |
| Paths | `/Fortnite.com/Devices` | Blue `#569cd6` |
| Literals | `true`, `false` | Blue `#569cd6` |
| Punctuation | `:`, `;`, `,`, `@` | Slate blue `#8499b7` |

## Theme

The `verse-dark` theme ships as a standalone CSS file at `styles/verse-dark.css`. Colors are sourced from Epic Games' official [VS Code Verse extension](https://marketplace.visualstudio.com/items?itemName=epicgames.verse) (`verse-dark.tmTheme.json`).

The theme uses a transparent background, so it layers on top of whatever code block styling your site already has. Pair it with highlight.js's built-in dark themes, or use your own.

## Requirements

- highlight.js >= 11.0.0 (peer dependency)

## License

[MIT](LICENSE)

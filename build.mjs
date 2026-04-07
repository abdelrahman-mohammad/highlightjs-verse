import { build } from 'esbuild';

// ESM build for bundlers (Vite, webpack, etc.)
await build({
    entryPoints: ['src/languages/verse.js'],
    outfile: 'dist/verse.es.min.js',
    format: 'esm',
    bundle: true,
    minify: true,
});

// IIFE build for browser <script> tags — auto-registers with global hljs
await build({
    entryPoints: ['src/languages/verse.js'],
    outfile: 'dist/verse.min.js',
    format: 'iife',
    globalName: 'hljsDefineVerse',
    bundle: true,
    minify: true,
    footer: {
        js: 'if(typeof hljs!=="undefined"){hljs.registerLanguage("verse",hljsDefineVerse);}'
    },
});

console.log('Built dist/verse.es.min.js and dist/verse.min.js');

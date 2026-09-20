const hljs = require('highlight.js/lib/core');
const verse = require('../src/languages/verse.js');

hljs.registerLanguage('verse', verse);

function highlight(code) {
    return hljs.highlight(code, { language: 'verse' }).value;
}

function expectToken(code, className, text) {
    const html = highlight(code);
    const escaped = text.replace(/[&<>"]/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
    })[c]);
    expect(html).toContain(`<span class="hljs-${className}">${escaped}</span>`);
}

describe('highlightjs-verse', () => {
    describe('grammar registration', () => {
        test('registers with name "Verse"', () => {
            const lang = verse({});
            expect(lang.name).toBe('Verse');
        });

        test('registers alias "verse"', () => {
            const lang = verse({});
            expect(lang.aliases).toContain('verse');
        });

        test('is case-sensitive', () => {
            const lang = verse({});
            expect(lang.case_insensitive).toBe(false);
        });

        test('contains 14 rules', () => {
            const lang = verse({});
            expect(lang.contains).toHaveLength(14);
        });
    });

    describe('comments', () => {
        test('line comment', () => {
            expectToken('# this is a comment', 'comment', '# this is a comment');
        });

        test('block comment', () => {
            const html = highlight('<# block #>');
            expect(html).toContain('hljs-comment');
        });

        test('nested block comment ends at the outer #>', () => {
            const html = highlight('<# a <# b #> c #> Code()');
            expect(html).toContain('&lt;# b #&gt;</span> c #&gt;</span>');
            expect(html).toContain('<span class="hljs-title function_">Code</span>');
        });

        test('<# inside a line comment opens a block that runs to #> on a later line', () => {
            const html = highlight('# note <# x\ny\n#>\nCode()');
            expect(html).toContain('x\ny\n#&gt;</span>');
            expect(html).toContain('<span class="hljs-title function_">Code</span>');
        });
    });

    // <#> comments the rest of its line and every line indented past it.
    // Each case asserts both halves: what is comment, and what is code again.
    describe('indented comment marker <#>', () => {
        test('does not swallow the next unindented line', () => {
            const html = highlight('<#> Indented comment\nMyFunction():void =\n    Print("this is code")\n');
            expect(html).toContain('<span class="hljs-comment">&lt;#&gt; Indented comment</span>');
            expect(html).toContain('<span class="hljs-title function_">MyFunction</span>');
            expect(html).toContain('<span class="hljs-string">&quot;this is code&quot;</span>');
        });

        test('comments the indented body and stops at the first dedent', () => {
            const html = highlight('<#> marker\n    body one\n    body two\nCode()\n');
            expect(html).toContain('<span class="hljs-comment">&lt;#&gt; marker\n    body one\n    body two</span>');
            expect(html).toContain('<span class="hljs-title function_">Code</span>');
        });

        test('a blank line inside the body does not end it', () => {
            const html = highlight('<#> marker\n    body\n\n    more body\nCode()\n');
            expect(html).toContain('<span class="hljs-comment">&lt;#&gt; marker\n    body\n\n    more body</span>');
            expect(html).toContain('<span class="hljs-title function_">Code</span>');
        });

        test('measures the body against the indent of the marker line', () => {
            const html = highlight('    <#> marker\n        body\n    Sibling()\n');
            expect(html).toContain('<span class="hljs-comment">&lt;#&gt; marker\n        body</span>');
            expect(html).toContain('<span class="hljs-title function_">Sibling</span>');
        });

        test('a marker mid-line comments only from the marker on', () => {
            const html = highlight('using { /A } <#> why\n    because\nCode()\n');
            expect(html).toContain('<span class="hljs-keyword">using</span>');
            expect(html).toContain('<span class="hljs-comment">&lt;#&gt; why\n    because</span>');
            expect(html).toContain('<span class="hljs-title function_">Code</span>');
        });

        test('is plain text inside a line comment', () => {
            const html = highlight('# note <#> here\nCode()\n');
            expect(html).toContain('<span class="hljs-comment"># note &lt;#&gt; here</span>');
            expect(html).toContain('<span class="hljs-title function_">Code</span>');
        });

        test('is plain text inside a block comment', () => {
            const html = highlight('<# a <#> b #> Code()\n');
            expect(html).toContain('<span class="hljs-comment">&lt;# a &lt;#&gt; b #&gt;</span>');
            expect(html).toContain('<span class="hljs-title function_">Code</span>');
        });

        test('does not end a block comment that comments out a marker and its body', () => {
            const html = highlight('<#\n<#> old note\n    more\nOld():void = 1\n#>\nLive():void = 2\n');
            expect(html).toContain('<span class="hljs-comment">&lt;#\n&lt;#&gt; old note\n    more\nOld():void = 1\n#&gt;</span>');
            expect(html).toContain('<span class="hljs-title function_">Live</span>');
        });

        test('a <# opened in the body runs past a dedent to its #>', () => {
            const html = highlight('<#> marker\n    <# block\nCode()\n#>\nAfter()\n');
            expect(html).toContain('<span class="hljs-comment">&lt;# block\nCode()\n#&gt;</span></span>');
            expect(html).toContain('<span class="hljs-title function_">After</span>');
        });

        test('handles CRLF line endings', () => {
            const html = highlight('<#> marker\r\n    body\r\nCode()\r\n');
            expect(html).toContain('<span class="hljs-comment">&lt;#&gt; marker\r\n    body</span>');
            expect(html).toContain('<span class="hljs-title function_">Code</span>');
        });
    });

    describe('strings', () => {
        test('double-quoted string', () => {
            expectToken('"hello world"', 'string', '"hello world"');
        });

        test('string with escape sequence', () => {
            const html = highlight('"hello\\n"');
            expect(html).toContain('hljs-char');
            expect(html).toContain('\\n');
        });

        test('string interpolation', () => {
            const html = highlight('"value: {x}"');
            expect(html).toContain('hljs-subst');
        });
    });

    describe('numbers', () => {
        test('integer', () => {
            expectToken('42', 'number', '42');
        });

        test('float', () => {
            expectToken('3.14', 'number', '3.14');
        });

        test('hex', () => {
            expectToken('0xFF', 'number', '0xFF');
        });

        test('scientific notation', () => {
            expectToken('1e10', 'number', '1e10');
        });
    });

    describe('keywords', () => {
        test('control flow keywords', () => {
            expectToken('return', 'keyword', 'return');
            expectToken('yield', 'keyword', 'yield');
            expectToken('break', 'keyword', 'break');
            expectToken('continue', 'keyword', 'continue');
        });

        test('block keywords as built_in', () => {
            expectToken('x then y', 'built_in', 'then');
            expectToken('x else y', 'built_in', 'else');
        });

        test('declaration keywords as type', () => {
            const html = highlight('var x : int = 0');
            expect(html).toContain('hljs-type');
        });

        test('literals', () => {
            expectToken('true', 'literal', 'true');
            expectToken('false', 'literal', 'false');
        });
    });

    // Words the compiler reserves. Epic's grammar scopes none of them; this
    // package does, for readability, the way it already does for specifiers.
    describe('reserved words and built-in types', () => {
        const BLOCK_MACROS = ['if', 'for', 'loop', 'block', 'case', 'defer', 'spawn', 'race', 'sync', 'rush', 'branch', 'let', 'batch', 'first', 'assert'];
        const BUILTIN_TYPES = ['int', 'float', 'string', 'void', 'char', 'logic', 'any', 'comparable', 'tuple', 'rational', 'array', 'map', 'option'];

        test.each(BLOCK_MACROS)('block macro %s is built_in', (word) => {
            expectToken(word, 'built_in', word);
        });

        test.each(BUILTIN_TYPES)('built-in type %s is type', (word) => {
            expectToken(word, 'type', word);
        });

        test('if before a parenthesis is a keyword, not a function name', () => {
            const html = highlight('if (X > 1):');
            expect(html).toContain('<span class="hljs-built_in">if</span>');
            expect(html).not.toContain('function_">if<');
        });

        test('for before a parenthesis is a keyword; the loop variable is still a definition', () => {
            const html = highlight('for (Y := 0..3):');
            expect(html).toContain('<span class="hljs-built_in">for</span>');
            expect(html).toContain('<span class="hljs-title function_">Y</span>');
        });

        test('tuple before a parenthesis is a type, not a function name', () => {
            const html = highlight('T:tuple(int, int) = (1, 2)');
            expect(html).toContain('<span class="hljs-title function_">T</span>');
            expect(html).toContain('<span class="hljs-type">tuple</span>(<span class="hljs-type">int</span>');
            expect(html).not.toContain('function_">tuple<');
        });

        test('case before a parenthesis is a keyword', () => {
            const html = highlight('case(X):');
            expect(html).toContain('<span class="hljs-built_in">case</span>');
        });

        test('concurrency block', () => {
            const html = highlight('race:\n    sync:\n        branch:\n            spawn{Go()}');
            for (const word of ['race', 'sync', 'branch', 'spawn']) {
                expect(html).toContain(`<span class="hljs-built_in">${word}</span>`);
            }
            expect(html).toContain('<span class="hljs-title function_">Go</span>');
        });

        test('a rejected keyword does not match again from its second character', () => {
            const html = highlight('if (X)');
            expect(html).not.toContain('function_">f<');
            expect(html).toContain('<span class="hljs-built_in">if</span> (X)');
        });

        test.each(['format(2)', 'intern := 3', 'letter()', 'forest : int = 4'])('an identifier that starts with a keyword is still an identifier: %s', (code) => {
            const name = code.match(/^\w+/)[0];
            expect(highlight(code)).toContain(`<span class="hljs-title function_">${name}</span>`);
        });

        test('the identifier guard covers every keyword bucket and carries no relevance suffix', () => {
            const lang = verse({});
            const guard = lang.contains.find(rule => rule.scope === 'title.function').match;
            const guarded = guard.match(/\(\?:([^)]*)\)/)[1].split('|');
            const keywords = Object.keys(lang.keywords)
                .flatMap(bucket => lang.keywords[bucket].split(' '))
                .map(entry => entry.split('|')[0]);
            expect(new Set(guarded)).toEqual(new Set(keywords));
            expect(guarded).not.toContain('0');
        });

        test('words the compiler has only reserved for the future stay plain', () => {
            // ReservedFuture or gated at an unshipped version: still legal identifiers.
            for (const word of ['profile', 'await', 'upon', 'dictate']) {
                expect(highlight(word)).toBe(word);
            }
        });

        test('function calls are unchanged', () => {
            expect(highlight('Print("x")')).toContain('<span class="hljs-title function_">Print</span>');
            expect(highlight('MyFunc<public>()')).toContain('<span class="hljs-title function_">MyFunc</span>');
        });

        test('definitions are unchanged and their types are scoped', () => {
            const html = highlight('Score : int = 0');
            expect(html).toContain('<span class="hljs-title function_">Score</span>');
            expect(html).toContain('<span class="hljs-type">int</span>');
        });
    });

    describe('type specifiers', () => {
        test('class keyword', () => {
            expectToken('class', 'keyword', 'class');
        });

        test('struct keyword', () => {
            expectToken('struct', 'keyword', 'struct');
        });

        test('interface keyword', () => {
            expectToken('interface', 'keyword', 'interface');
        });

        test('effect specifiers', () => {
            expectToken('suspends', 'keyword', 'suspends');
            expectToken('transacts', 'keyword', 'transacts');
            expectToken('decides', 'keyword', 'decides');
        });

        test('memory effect specifiers (reads/writes/allocates)', () => {
            expectToken('reads', 'keyword', 'reads');
            expectToken('writes', 'keyword', 'writes');
            expectToken('allocates', 'keyword', 'allocates');
        });

        test('class modifiers (castable/final_super/persistable)', () => {
            expectToken('castable', 'keyword', 'castable');
            expectToken('final_super', 'keyword', 'final_super');
            expectToken('persistable', 'keyword', 'persistable');
        });

        test('access modifier scoped', () => {
            expectToken('scoped', 'keyword', 'scoped');
        });

        test('function attribute localizes', () => {
            expectToken('localizes', 'keyword', 'localizes');
        });

        test('native_callable specifier', () => {
            expectToken('native_callable', 'keyword', 'native_callable');
        });

        test('final_super does not collide with final', () => {
            // Regression: longer alternatives must win over shorter prefixes
            const html = highlight('final_super');
            expect(html).toContain('<span class="hljs-keyword">final_super</span>');
            expect(html).not.toContain('<span class="hljs-keyword">final</span>_super');
        });

        test('native_callable does not collide with native', () => {
            const html = highlight('native_callable');
            expect(html).toContain('<span class="hljs-keyword">native_callable</span>');
            expect(html).not.toContain('<span class="hljs-keyword">native</span>_callable');
        });

        test('unique class with allocates effect (UEFN 31.00+)', () => {
            const html = highlight('MyData := class<unique><allocates>:');
            expect(html).toContain('<span class="hljs-keyword">class</span>');
            expect(html).toContain('<span class="hljs-keyword">unique</span>');
            expect(html).toContain('<span class="hljs-keyword">allocates</span>');
        });

        test.each(['constructor', 'predicts', 'open', 'final_super_base', 'persistent', 'module_scoped_var_weak_map_key', 'uht_comparable'])(
            'specifier %s shipped in Epic digests',
            (word) => {
                expectToken(word, 'keyword', word);
            }
        );

        test('final_super_base does not collide with final_super or final', () => {
            const html = highlight('final_super_base');
            expect(html).toContain('<span class="hljs-keyword">final_super_base</span>');
            expect(html).not.toContain('<span class="hljs-keyword">final_super</span>_base');
            expect(html).not.toContain('<span class="hljs-keyword">final</span>_super_base');
        });

        test('digest class header highlights every specifier', () => {
            const html = highlight('component<native><public> := class<abstract><unique><castable><final_super_base>:');
            for (const word of ['native', 'public', 'class', 'abstract', 'unique', 'castable', 'final_super_base']) {
                expect(html).toContain(`<span class="hljs-keyword">${word}</span>`);
            }
        });
    });

    describe('operators', () => {
        test('arithmetic operators', () => {
            const html = highlight('a + b');
            expect(html).toContain('hljs-operator');
        });

        test('arrow operator', () => {
            const html = highlight('a -> b');
            expect(html).toContain('hljs-operator');
        });

        test('logical operators', () => {
            expectToken('a and b', 'operator', 'and');
            expectToken('a or b', 'operator', 'or');
            expectToken('not x', 'operator', 'not');
        });
    });

    describe('definitions and function calls', () => {
        test('definition with type annotation', () => {
            const html = highlight('Score : int = 0');
            expect(html).toContain('hljs-title function_');
            expect(html).toContain('Score');
        });

        test('definition with assignment', () => {
            const html = highlight('MyDevice := class(creative_device)');
            expect(html).toContain('hljs-title function_');
            expect(html).toContain('MyDevice');
        });

        test('function call', () => {
            const html = highlight('Print("hello")');
            expect(html).toContain('hljs-title function_');
            expect(html).toContain('Print');
        });
    });

    describe('paths', () => {
        test('module path', () => {
            expectToken('/Fortnite.com/Devices', 'link', '/Fortnite.com/Devices');
        });
    });

    describe('punctuation', () => {
        test('colon', () => {
            const html = highlight('x : int');
            expect(html).toContain('hljs-punctuation');
        });

        test('decorator @', () => {
            const html = highlight('@editable');
            expect(html).toContain('hljs-punctuation');
        });

        test('definition assignment :=', () => {
            const html = highlight('x := 5');
            expect(html).toContain('hljs-punctuation');
        });
    });

    describe('using statement', () => {
        test('using keyword', () => {
            expectToken('using { /Fortnite.com/Devices }', 'keyword', 'using');
        });
    });

    describe('full code snippet', () => {
        test('highlights a realistic Verse class', () => {
            const code = `MyDevice := class(creative_device):
    @editable
    Greeting : string = "Hello, Verse!"
    Score : int = 0

    OnBegin<override>()<suspends> : void =
        # Print the greeting
        Print(Greeting)
        set Score += 1
        if (Score > 10):
            return`;

            const result = hljs.highlight(code, { language: 'verse' });
            expect(result.language).toBe('verse');
            expect(result.relevance).toBeGreaterThan(0);
            expect(result.value).toContain('hljs-keyword');
            expect(result.value).toContain('hljs-string');
            expect(result.value).toContain('hljs-comment');
            expect(result.value).toContain('hljs-number');
            expect(result.value).toContain('hljs-title');
            expect(result.value).toContain('hljs-punctuation');
        });
    });
});

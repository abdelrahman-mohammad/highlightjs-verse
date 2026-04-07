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

        test('contains 13 rules', () => {
            const lang = verse({});
            expect(lang.contains).toHaveLength(13);
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

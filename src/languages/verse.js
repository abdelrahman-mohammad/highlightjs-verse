/**
 * Verse language definition for highlight.js
 *
 * Based on Epic Games' TextMate grammar (verse.json) and verse-dark.tmTheme.json
 * from the VS Code Verse extension (epicgames.verse).
 *
 * Scope -> color mapping (verse-dark):
 *   keyword.control      (#569cd6 blue)      -> hljs keyword
 *   keyword.declaration  (#8499b7 slate blue) -> hljs built_in / type
 *   keyword.operator     (#77AFAF teal)       -> hljs operator
 *   entity.name.function (#e5c2ff purple)     -> hljs title.function
 *   variable             (#b9d6ff light blue) -> hljs variable
 *   punctuation.definition.tag (#8499b7 slate) -> hljs punctuation
 *   constant.language    (#569cd6 blue)       -> hljs link (paths)
 *   constant.numeric     (#c2ddb4 light green) -> hljs number
 *   comment              (#77B06B green)       -> hljs comment
 *   string               (#C09077 tan)         -> hljs string
 *   constant.character.escape (#B89047 gold)   -> hljs char.escape
 *
 * @see https://dev.epicgames.com/documentation/en-us/uefn/verse-language-reference
 */
function hljsDefineVerse(hljs) {
    // --- Keywords --------------------------------------------------------
    // Grouped by TextMate scope for correct color mapping:
    //   keyword  -> keyword.control.verse  (#569cd6 blue)
    //   built_in -> keyword.declaration.verse (#8499b7 slate blue)
    //   type     -> keyword.declaration.verse (#8499b7 slate blue)
    //   literal  -> constant.language (#569cd6 blue)
    //
    // Epic's grammar scopes the literal words in KEYWORDS below and nothing
    // in BLOCK_MACROS or BUILTIN_TYPES. Those are words the compiler reserves
    // (ReservedSymbols.inl), added for readability the way the specifiers
    // are. Only words reserved at a shipped version belong: profile, await,
    // upon and dictate are still legal identifiers and must stay out.
    //
    // `|0` zeroes a word's auto-detection relevance. Every word that is a
    // keyword, builtin or everyday name in other languages carries it, or a
    // plain C or JS snippet fed to highlightAuto scores as Verse.
    var BLOCK_MACROS = 'if for loop|0 block|0 case|0 defer|0 spawn|0 race|0 sync|0 rush branch let|0 batch|0 first|0 assert|0';
    var BUILTIN_TYPES = 'int|0 float|0 string|0 void|0 char|0 logic any|0 comparable tuple|0 rational array|0 map|0 option';
    var KEYWORDS = {
        keyword: 'return yield break continue',
        built_in: 'with do until catch then else of at over when where while next ' + BLOCK_MACROS,
        type: 'var set ref alias live in is ' + BUILTIN_TYPES,
        literal: 'true false'
    };

    // Keeps the identifier rules below off every keyword. Rules with a match
    // are scanned before keywords are applied, so without this `if (X)` is a
    // function name. The leading \b is load-bearing: when the lookahead
    // rejects `if` at its first letter, the engine retries one character on
    // and `f (` would match.
    var NOT_KEYWORD = '\\b(?!(?:' +
        Object.keys(KEYWORDS)
            .map(function (bucket) { return KEYWORDS[bucket]; })
            .join(' ')
            .split(' ')
            .map(function (word) { return word.split('|')[0]; })
            .join('|') +
        ')\\b)';
    var IDENT = "[A-Za-z_]\\w*(?:'[^']*')?";

    // --- Block comment: <# ... #> (nestable) -----------------------------
    // Both guards keep <#> out, as in Epic's grammar. It is a different
    // token: on begin, this rule is reachable from comment bodies where a
    // marker is not; on end, the #> half of a <#> must not close the block.
    var BLOCK_COMMENT = {
        scope: 'comment',
        begin: /<#(?!>)/,
        end: /(?<!<)#>/,
        contains: ['self'],
        relevance: 10
    };

    // Leading-space count from an offset. A raw count agrees with the
    // compiler on every file it accepts, because it rejects mixed
    // tab/space indentation outright.
    function indentOf(text, from) {
        var i = from;
        while (text[i] === ' ' || text[i] === '\t') i++;
        return i - from;
    }

    // --- Indented comment marker: <#> ------------------------------------
    // Comments the rest of its line and every following line indented past
    // the marker's line, blank lines included. The end must consume the
    // newline: an ignored zero-width end never advances the cursor and
    // highlight.js spins until its iteration guard throws.
    var INDENTED_COMMENT = {
        scope: 'comment',
        begin: /<#>/,
        end: /\r?\n/,
        excludeEnd: true,
        contains: [BLOCK_COMMENT],
        relevance: 10,
        'on:begin': function (match, response) {
            var lineStart = match.input.lastIndexOf('\n', match.index - 1) + 1;
            response.data.indent = indentOf(match.input, lineStart);
        },
        'on:end': function (match, response) {
            var text = match.input;
            var i = match.index + match[0].length;
            // Skip blank lines to the next line with content. Only
            // whitespace left means the end stands here; trailing blank
            // lines render the same either side of the span.
            for (;;) {
                var lineEnd = text.indexOf('\n', i);
                if (lineEnd === -1) lineEnd = text.length;
                if (text.slice(i, lineEnd).trim() !== '') break;
                if (lineEnd === text.length) return;
                i = lineEnd + 1;
            }
            if (indentOf(text, i) > response.data.indent) response.ignoreMatch();
        }
    };

    // --- Line comment: # to EOL (not part of <# or #>) ------------------
    // Official grammar: (?<!<)#(?!>) with nested BlockCmt support
    var LINE_COMMENT = {
        scope: 'comment',
        begin: '(?<!<)#(?!>)',
        end: '$',
        contains: [BLOCK_COMMENT],
        relevance: 0
    };

    // --- Escape sequences inside strings/chars ---------------------------
    // Official: \\(\<(?!#)|[rnt'\\"\\{}#<>&~]|$)
    var ESCAPE = {
        scope: 'char.escape',
        match: '\\\\[rnt\'"\\\\{}#<>&~]',
        relevance: 0
    };

    // --- String interpolation: {expr} inside strings ---------------------
    // Official scope: constant.character.escape for { and }
    var INTERPOLATION = {
        scope: 'subst',
        begin: '\\{',
        end: '\\}',
        keywords: KEYWORDS,
        contains: []  // filled below to allow recursion
    };

    // --- Double-quoted string: "..." -------------------------------------
    var STRING = {
        scope: 'string',
        begin: '"',
        end: '"|$',
        contains: [ESCAPE, INTERPOLATION],
        relevance: 0
    };

    // --- Character literals: 'x', '\n', 0o/0u hex -----------------------
    // Official: CharLit0 ('x'), CharLit1 ('\n'), Char8 (0o_), Char32 (0u_)
    var CHAR_LITERAL = {
        scope: 'string',
        variants: [
            { match: "'\\\\[rnt'\"\\\\{}#<>&~]'" },
            { match: "'[^'\\\\]'" },
            { match: '\\b0[ou][0-9A-Fa-f]+\\b' }
        ],
        relevance: 0
    };

    // --- Numbers: 0x hex, decimal, float, optional unit ------------------
    // Official: 0x hex, then (?!0o|0u)[0-9]+ with optional .frac, exp, unit
    var NUMBER = {
        scope: 'number',
        variants: [
            { match: '\\b0x[0-9A-Fa-f]+\\b' },
            { match: '\\b[0-9]+(?:\\.[0-9]+)?(?:e[+-]?[0-9]+)?\\b' }
        ],
        relevance: 0
    };

    // --- Paths: /Package/Module/Type -------------------------------------
    // Official scope: constant.language.path.verse -> blue via constant.language
    var PATH = {
        scope: 'link',
        match: '/[A-Za-z_][A-Za-z0-9_.@/-]*',
        relevance: 5
    };

    // --- Function / method call: name( or name<spec> ---------------------
    // Official scope: entity.name.function.verse (#e5c2ff purple)
    // Matches identifiers before ( or <word (not <# which starts a comment)
    var FUNCTION_CALL = {
        scope: 'title.function',
        match: NOT_KEYWORD + IDENT + '(?=\\s*(?:\\(|<(?!#)\\w))',
        relevance: 0
    };

    // --- Definition: name : type or name := -----------------------------
    // Approximates DefineIdent1/DefineIdent2 from official grammar.
    // Official scope: entity.name.function.verse (#e5c2ff purple)
    var DEFINITION = {
        scope: 'title.function',
        match: NOT_KEYWORD + IDENT + '(?=\\s*(?::\\s*[A-Za-z_({/\\[]|:=))',
        relevance: 0
    };

    // --- Class/struct/interface/enum specifiers ---------------------------
    // Not separate keywords in the official grammar (just identifiers),
    // but highlighting these as keywords improves readability.
    // Grouped by kind:
    //   Declaration kinds: class struct interface enum module trait
    //   Class modifiers:   unique abstract concrete final final_super final_super_base
    //                      castable persistable persistent uht_comparable
    //                      module_scoped_var_weak_map_key
    //   Enum modifiers:    open
    //   Access modifiers:  internal public private protected scoped epic_internal
    //   Inheritance:       override
    //   Effect specifiers: transacts varies computes converges decides no_rollback
    //                      suspends reads writes allocates predicts
    //   Function attrs:    localizes constructor
    //   Interop:           native native_callable
    var TYPE_SPECIFIER = {
        match: /\b(class|struct|interface|enum|module|trait|unique|abstract|concrete|final_super_base|final_super|final|castable|persistable|persistent|uht_comparable|module_scoped_var_weak_map_key|open|internal|public|private|protected|scoped|epic_internal|override|transacts|varies|computes|converges|decides|no_rollback|suspends|reads|writes|allocates|predicts|localizes|constructor|native_callable|native)\b/,
        scope: 'keyword',
        relevance: 5
    };

    // --- Using statement -------------------------------------------------
    var USING = {
        match: /\b(using)\b/,
        scope: 'keyword',
        relevance: 10
    };

    // --- Operators -------------------------------------------------------
    // Official scopes: keyword.operator.verse, keyword.operator.arithmetic,
    // keyword.operator.comparison -> all #77AFAF teal
    var OPERATOR = {
        scope: 'operator',
        match: '<>|<=|>=|=>|->|\\.\\.|[+\\-*/]=|[+\\-*/=<>|]',
        relevance: 0
    };

    // --- Logical operator keywords ---------------------------------------
    // Official scope: keyword.operator.logical.verse (#77AFAF teal)
    var LOGICAL_OPERATOR = {
        match: /\b(and|or|not)\b/,
        scope: 'operator',
        relevance: 0
    };

    // --- Definition punctuation ------------------------------------------
    // Official scope: punctuation.definition.tag (#8499b7 slate blue)
    // := is definition assignment, @ is decorator/attribute, & is reference
    var PUNCTUATION = {
        scope: 'punctuation',
        match: ':=|[@&:;,]',
        relevance: 0
    };

    // Fill interpolation contents (recursive references)
    INTERPOLATION.contains = [
        INDENTED_COMMENT,
        BLOCK_COMMENT,
        LINE_COMMENT,
        STRING,
        CHAR_LITERAL,
        NUMBER,
        PATH,
        ESCAPE,
        PUNCTUATION,
        OPERATOR
    ];

    // Base text color set to #b9d6ff (variable/identifier) in CSS,
    // so unmatched identifiers naturally appear light blue.
    // Keywords override via the keywords property on root.
    return {
        name: 'Verse',
        aliases: ['verse'],
        case_insensitive: false,
        keywords: KEYWORDS,
        contains: [
            INDENTED_COMMENT,
            BLOCK_COMMENT,
            LINE_COMMENT,
            STRING,
            CHAR_LITERAL,
            NUMBER,
            PATH,
            USING,
            TYPE_SPECIFIER,
            FUNCTION_CALL,
            DEFINITION,
            LOGICAL_OPERATOR,
            PUNCTUATION,
            OPERATOR
        ]
    };
}

module.exports = hljsDefineVerse;

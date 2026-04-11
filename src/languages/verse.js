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
    var KEYWORDS = {
        keyword: 'return yield break continue',
        built_in: 'with do until catch then else of at over when where while next',
        type: 'var set ref alias live in is',
        literal: 'true false'
    };

    // --- Block comment: <# ... #> (nestable) -----------------------------
    var BLOCK_COMMENT = {
        scope: 'comment',
        begin: '<#',
        end: '#>',
        contains: ['self'],
        relevance: 10
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
        match: /[A-Za-z_]\w*(?:'[^']*')?(?=\s*(?:\(|<(?!#)\w))/,
        relevance: 0
    };

    // --- Definition: name : type or name := -----------------------------
    // Approximates DefineIdent1/DefineIdent2 from official grammar.
    // Official scope: entity.name.function.verse (#e5c2ff purple)
    var DEFINITION = {
        scope: 'title.function',
        match: /[A-Za-z_]\w*(?:'[^']*')?(?=\s*(?::\s*[A-Za-z_({/\[]|:=))/,
        relevance: 0
    };

    // --- Class/struct/interface/enum specifiers ---------------------------
    // Not separate keywords in the official grammar (just identifiers),
    // but highlighting these as keywords improves readability.
    // Grouped by kind:
    //   Declaration kinds: class struct interface enum module trait
    //   Class modifiers:   unique abstract concrete final final_super castable persistable
    //   Access modifiers:  internal public private protected scoped epic_internal
    //   Inheritance:       override
    //   Effect specifiers: transacts varies computes converges decides no_rollback
    //                      suspends reads writes allocates
    //   Function attrs:    localizes
    //   Interop:           native native_callable
    var TYPE_SPECIFIER = {
        match: /\b(class|struct|interface|enum|module|trait|unique|abstract|concrete|final_super|final|castable|persistable|internal|public|private|protected|scoped|epic_internal|override|transacts|varies|computes|converges|decides|no_rollback|suspends|reads|writes|allocates|localizes|native_callable|native)\b/,
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

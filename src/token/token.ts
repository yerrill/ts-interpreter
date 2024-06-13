export type TokenType = string;

export type Token = {
    literal: string;
    type: TokenType;
}

export const ILLEGAL: TokenType = "ILLEGAL";
export const EOF: TokenType = "EOF";

export const IDENT: TokenType = "IDENT";
export const INT: TokenType = "INT";

export const ASSIGN: TokenType = "=";
export const PLUS: TokenType = "+";
export const MINUS: TokenType = "-";
export const BANG: TokenType = "!";
export const ASTERISK: TokenType = "*";
export const SLASH: TokenType = "/";
export const MOD: TokenType = "%";
export const LT: TokenType = "<";
export const GT: TokenType = ">";

export const LT_EQ: TokenType = "<=";
export const GT_EQ: TokenType = ">=";
export const EQ: TokenType = "==";
export const NOT_EQ: TokenType = "!=";
export const PLUS_EQ: TokenType = "+=";
export const MINUS_EQ: TokenType = "-=";
export const AST_EQ: TokenType = "*=";
export const SLASH_EQ: TokenType = "/=";

export const COMMA: TokenType = ",";
export const SEMICOLON: TokenType = ";";

export const LPAREN: TokenType = "(";
export const RPAREN: TokenType = ")"
export const LBRACE: TokenType = "{"
export const RBRACE: TokenType = "}"

export const FUNCTION: TokenType = "FUNCTION";
export const LET: TokenType = "LET";
export const RETURN: TokenType = "RETURN";
export const TRUE: TokenType = "TRUE";
export const FALSE: TokenType = "FALSE";
export const IF: TokenType = "IF";
export const ELSE: TokenType = "ELSE";

const keywords: Map<string, TokenType> = new Map([
    ["fnc", FUNCTION],
    ["let", LET],
    ["return", RETURN],
    ["true", TRUE],
    ["false", FALSE],
    ["if", IF],
    ["else", ELSE]
]);

export function lookup(literal: string): TokenType {
    let tok = keywords.get(literal);

    if(tok == null) {
        return IDENT;
    }

    return tok;
}

export function createToken( tokenLiteral: string, tokenType: TokenType): Token {
    return {type: tokenType, literal: tokenLiteral} as Token;
}

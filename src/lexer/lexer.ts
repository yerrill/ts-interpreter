import * as token from "../token/token";

const CHAR_0 = "0".charCodeAt(0);
const CHAR_9 = "9".charCodeAt(0);

const CHAR_a = "a".charCodeAt(0);
const CHAR_z = "z".charCodeAt(0);

const CHAR_A = "A".charCodeAt(0);
const CHAR_Z = "Z".charCodeAt(0);

const CHAR__ = "_".charCodeAt(0);

function isLetter(character: string): boolean {
    const char = character.charCodeAt(0);
    return CHAR_a <= char && CHAR_z >= char || CHAR_A <= char && CHAR_Z >= char || char === CHAR__;
}

function isNumber(character: string): boolean {
    const char = character.charCodeAt(0);
    return CHAR_0 <= char && CHAR_9 >= char;
}

export class Lexer {
    private input: string;
    private position: number;
    private nextPosition: number;
    private ch: string;

    constructor(program: string) {
        this.input = program;
        this.position = 0;
        this.nextPosition = 0;
        this.ch = '\0';

        this.readChar();
    }

    get state(): string {
        return `position: ${this.position}, nextPosition: ${this.nextPosition}, ch: ${this.ch}`;
    }

    get isEOF(): boolean {
        return this.position >= this.input.length;
    }

    public nextToken(): token.Token {
        let resultToken: token.Token;
        let identifierCase: boolean = false;

        this.skipWhitespace();

        switch(this.ch) {
            case '=':
                resultToken = this.createEqualsSuffixedToken(token.ASSIGN, token.EQ);
                break;
            case '+':
                resultToken = this.createEqualsSuffixedToken(token.PLUS, token.PLUS_EQ);
                break;
            case '-':
                resultToken = this.createEqualsSuffixedToken(token.MINUS, token.MINUS_EQ);
                break;
            case '!':
                resultToken = this.createEqualsSuffixedToken(token.BANG, token.NOT_EQ);
                break;
            case '*':
                resultToken = this.createEqualsSuffixedToken(token.ASTERISK, token.AST_EQ);
                break;
            case '/':
                resultToken = this.createEqualsSuffixedToken(token.SLASH, token.SLASH_EQ);
                break;
            case '%':
                resultToken = token.createToken(this.ch, token.MOD);
                break;
            case '<':
                resultToken = this.createEqualsSuffixedToken(token.LT, token.LT_EQ);
                break;
            case '>':
                resultToken = this.createEqualsSuffixedToken(token.GT, token.GT_EQ);
                break;
            case ',':
                resultToken = token.createToken(this.ch, token.COMMA);
                break;
            case ';':
                resultToken = token.createToken(this.ch, token.SEMICOLON);
                break;
            case '(':
                resultToken = token.createToken(this.ch, token.LPAREN);
                break;
            case ')':
                resultToken = token.createToken(this.ch, token.RPAREN);
                break;
            case '{':
                resultToken = token.createToken(this.ch, token.LBRACE);
                break;
            case '}':
                resultToken = token.createToken(this.ch, token.RBRACE);
                break;
            case '\0':
                resultToken = token.createToken(this.ch, token.EOF);
                break;
            default:
                identifierCase = true;
                resultToken = this.readNonSymbolToken();
        }

        identifierCase ? null : this.readChar();
        return resultToken;
    }

    private get len(): number {
        return this.input.length;
    }

    private readChar(): string { // Advance character state of the object
        if (this.nextPosition >= this.len) {
            this.ch = '\0';
        } else {
            this.ch = this.input[this.nextPosition];
        }

        this.position = this.nextPosition;
        this.nextPosition += 1;

        return this.ch;
    }

    private skipWhitespace(): void {
        while (this.ch === " " || this.ch === "\t" || this.ch === "\n" || this.ch === "\r") {
            this.readChar();
        }
    }

    private peekChar(): string {
        if(this.nextPosition >= this.len) {
            return '\0';
        } else {
            return this.input[this.nextPosition]
        }
    }

    private createEqualsSuffixedToken(baseType: token.TokenType, modifiedType: token.TokenType): token.Token {
        if (this.peekChar() == '=') { // {firstchar}=
            const ch: string = this.ch;
            this.readChar();
            return token.createToken(`${ch}${this.ch}`, modifiedType);
        } else {
            return token.createToken(this.ch, baseType);
        }
    }

    private readNonSymbolToken(): token.Token {
        if (isLetter(this.ch)) {
            let literal: string = this.readCondition(isLetter);
            return token.createToken(literal, token.lookup(literal));
        } else if (isNumber(this.ch)) {
            let literal: string = this.readCondition(isNumber);
            return token.createToken(literal, token.INT);
        } else {
            return token.createToken("", token.EOF);
        }
    }

    private readCondition(condition: (val: string) => boolean): string {
        const startPosition = this.position;

        while(condition(this.ch)) {
            this.readChar();
        }

        return this.input.slice(startPosition, this.position);
    } 
}
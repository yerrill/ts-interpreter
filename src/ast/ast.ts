import * as token from "../token/token";

export interface Node {
    token: token.Token;
    TokenLiteral(): string;
    toString(): string;
}

export interface Statement extends Node {
    statementNode(): void;
}

export interface Expression extends Node {
    expressionNode(): void;
}

export class ErrorStatement implements Statement {
    token: token.Token;

    constructor(token: token.Token) {
        this.token = token;
    }

    public statementNode(): void {
        throw new Error("Method not implemented.");
    }
    
    public TokenLiteral(): string {
        return this.token.literal;
    }
    
    public toString(): string {
        return `ErrorStatement: ${this.token.literal}, ${this.token.type}`;
    }
}

export class ErrorExpression implements Expression {
    token: token.Token;
    expected?: token.TokenType;
    msg?: string;

    constructor(actual: token.Token, expected?: token.TokenType, msg?: string) {
        this.token = actual;
        this.expected = expected;
        this.msg = msg;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }
    
    public TokenLiteral(): string {
        return this.token.literal;
    }
    
    public toString(): string {
        return `(ErrorExpression: ${this.token.type}, ${this.token.literal}, ${this.expected}, ${this.msg})`;
    }
}

export class Program implements Node {
    statements: Statement[];

    constructor(s: Statement[]) {
        this.statements = s;
    }

    get token(): token.Token {
        if ( this.statements.length > 0 ) {
            return this.statements[0].token;
        } else {
            return token.createToken("", token.ILLEGAL);
        }
    }

    public TokenLiteral(): string {
        if ( this.statements.length > 0 ) {
            return this.statements[0].TokenLiteral();
        } else {
            return "";
        }
    }

    public toString(): string {
        let outString = "";

        for(let s in this.statements) {
            outString += this.statements[s].toString();
        }

        return outString;
    }
}

// Statements

export class LetStatement implements Statement {

    token: token.Token;
    name: Identifier;
    value: Expression;
    
    constructor(t: token.Token, n: Identifier, v: Expression) {
        this.token = t;
        this.name = n;
        this.value = v;
    }

    public statementNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): string {
        return this.token.literal;
    }

    public toString(): string {
        return `${this.token.literal} ${this.name.toString()} = ${this.value.toString()};\n`;
    }
}

export class ReturnStatement implements Statement {

    token: token.Token;
    value: Expression;

    constructor(t: token.Token, v: Expression) {
        this.token = t;
        this.value = v;
    }

    public statementNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): string {
        return this.token.literal;
    }

    public toString(): string {
        return `${this.token.literal} ${this.value.toString()};`;
    }
}

export class ExpressionStatement implements Statement {

    token: token.Token;
    value: Expression;

    constructor(t: token.Token, v: Expression) {
        this.token = t;
        this.value = v;
    }

    public statementNode(): void {
        throw new Error("Method not implemented.");
    }
    
    public TokenLiteral(): string {
        return this.token.literal;
    }

    public toString(): string {
        return this.value.toString();
    }
}

export class BlockStatement implements Statement {
    token: token.Token;
    statements: Statement[];

    constructor(t: token.Token, s: Statement[]) {
        this.token = t;
        this.statements = s;
    }

    public statementNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): string {
        return this.token.literal;
    }

    public toString(): string {
        //let outString = "";

        //for(let s in this.statements) {
        //    outString += this.statements[s].toString();
        //}

        //return outString;

        return `{\n${this.statements.map((node) => node.toString()).join()}\n}`;
    }
}

// Expressions

export class Identifier implements Expression {

    token: token.Token;
    name: string;

    constructor(t: token.Token, n: string) {
        this.token = t;
        this.name = n;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): string {
        throw new Error("Method not implemented.");
    }

    public toString(): string {
        return `${this.name}`;
    }
    
}

export class BooleanLiteral implements Expression {
    token: token.Token;
    value: boolean;

    constructor(t: token.Token, b: boolean) {
        this.token = t;
        this.value = b;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): string {
        return this.token.literal;
    }

    public toString(): string {
        return this.token.literal;
    }
}

export class IntegerLiteral implements Expression {
    token: token.Token;
    value: number;

    constructor(t: token.Token, n: number) {
        this.token = t;
        this.value = n;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): string {
        return this.token.literal;
    }

    public toString(): string {
        return this.token.literal;
    }
}

export class PrefixExpression implements Expression {
    token: token.Token;
    operator: string;
    right: Expression;

    constructor(t: token.Token, o: string, r: Expression) {
        this.token = t;
        this.operator = o;
        this.right = r;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): string {
        return this.token.literal;
    }

    public toString(): string {
        return `(${this.operator}${this.right.toString()})`;
    }
}

export class InfixExpression implements Expression {
    token: token.Token;
    left: Expression;
    operator: string;
    right: Expression;

    constructor(l: Expression, t: token.Token, o: string, r: Expression) {
        this.token = t;
        this.left = l;
        this.operator = o;
        this.right = r;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): string {
        return this.token.literal;
    }

    public toString(): string {
        return `(${this.left.toString()}${this.operator}${this.right.toString()})`;
    }
}

export class IfExpression implements Expression {
    token: token.Token;
    condition: Expression;
    consequence: BlockStatement;
    alternative?: BlockStatement;

    constructor(t: token.Token, condition: Expression, consequence: BlockStatement, a?: BlockStatement) {
        this.token = t;
        this.condition = condition;
        this.consequence = consequence;
        this.alternative = a;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }
    
    public TokenLiteral(): string {
        return this.token.literal;
    }

    public toString(): string {
        let alternativeBlockString: string = this.alternative == null ? "" : `else ${this.alternative.toString()}`;
        return `if ${this.condition.toString()} ${this.consequence.toString()} ${alternativeBlockString}`;
    }
}

export class FunctionLiteral implements Expression {
    token: token.Token;
    parameters: Identifier[];
    body: BlockStatement;

    constructor(t: token.Token, p: Identifier[], b: BlockStatement) {
        this.token = t;
        this.parameters = p;
        this.body = b;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): string {
        return this.token.literal;
    }

    public toString(): string {
        let parameterString: string = this.parameters.map((id) => id.toString()).join(", ");
        return `${this.token.literal}(${parameterString})${this.body.toString()}`;
    }
}

export class CallExpression implements Expression {
    token: token.Token;
    func: Expression;
    arguments: Expression[];

    constructor(t: token.Token, f: Expression, a: Expression[]) {
        this.token = t;
        this.func = f;
        this.arguments = a;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): string {
        return this.token.literal;
    }

    public toString(): string {
        let argumentString: string = this.arguments.map((ex) => ex.toString()).join(", ");
        return `${this.func.toString()}(${argumentString})`;
    }
}

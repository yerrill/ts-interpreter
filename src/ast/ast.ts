import * as token from "../token/token";

export interface Node {
    token: token.Token;
    TokenLiteral(): String;
    toString(): String;
}

export interface Statement extends Node {
    statementNode(): void;
}

export interface Expression extends Node {
    expressionNode(): void;
}

export class Program implements Node {
    statements: [Statement];

    constructor(s: [Statement]) {
        this.statements = s;
    }

    get token(): token.Token {
        if ( this.statements.length > 0 ) {
            return this.statements[0].token;
        } else {
            return token.createToken("", token.ILLEGAL);
        }
    }

    public TokenLiteral(): String {
        if ( this.statements.length > 0 ) {
            return this.statements[0].TokenLiteral();
        } else {
            return "";
        }
    }

    public toString(): String {
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

    public TokenLiteral(): String {
        return this.token.literal;
    }

    public toString(): String {
        return `${this.token.literal} ${this.name.toString()} = ${this.value.toString()};`;
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

    public TokenLiteral(): String {
        return this.token.literal;
    }

    public toString(): String {
        return `${this.token.literal} ${this.value.toString()}`;
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
    
    public TokenLiteral(): String {
        return this.token.literal;
    }

    public toString(): String {
        return this.value.toString();
    }
}

export class BlockStatement implements Statement {
    token: token.Token;
    statements: [Statement];

    constructor(t: token.Token, s: [Statement]) {
        this.token = t;
        this.statements = s;
    }

    public statementNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): String {
        return this.token.literal;
    }

    public toString(): String {
        //let outString = "";

        //for(let s in this.statements) {
        //    outString += this.statements[s].toString();
        //}

        //return outString;

        return this.statements.map((node) => node.toString()).join();
    }
}

// Expressions

export class Identifier implements Expression {

    token: token.Token;
    name: String;

    constructor(t: token.Token, n: String) {
        this.token = t;
        this.name = n;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): String {
        throw new Error("Method not implemented.");
    }

    public toString(): String {
        throw new Error("Method not implemented.");
    }
    
}

export class BooleanLiteral implements Expression {
    token: token.Token;
    value: Boolean;

    constructor(t: token.Token, b: Boolean) {
        this.token = t;
        this.value = b;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): String {
        return this.token.literal;
    }

    public toString(): String {
        return this.token.literal;
    }
}

export class IntegerLiteral implements Expression {
    token: token.Token;
    value: Number;

    constructor(t: token.Token, n: Number) {
        this.token = t;
        this.value = n;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): String {
        return this.token.literal;
    }

    public toString(): String {
        return this.token.literal;
    }
}

export class PrefixExpression implements Expression {
    token: token.Token;
    operator: String;
    right: Expression;

    constructor(t: token.Token, o: String, r: Expression) {
        this.token = t;
        this.operator = o;
        this.right = r;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): String {
        return this.token.literal;
    }

    public toString(): String {
        return `(${this.operator}${this.right.toString()})`;
    }
}

export class InfixExpression implements Expression {
    token: token.Token;
    left: Expression;
    operator: String;
    right: Expression;

    constructor(l: Expression, t: token.Token, o: String, r: Expression) {
        this.token = t;
        this.left = l;
        this.operator = o;
        this.right = r;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): String {
        return this.token.literal;
    }

    public toString(): String {
        return `(${this.left.toString()}${this.operator}${this.right.toString()})`;
    }
}

export class IfExpression implements Expression {
    token: token.Token;
    condition: Expression;
    consequence: BlockStatement;
    alternative: BlockStatement;

    constructor(t: token.Token, condition: Expression, consequence: BlockStatement, a: BlockStatement) {
        this.token = t;
        this.condition = condition;
        this.consequence = consequence;
        this.alternative = a;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }
    
    public TokenLiteral(): String {
        return this.token.literal;
    }

    public toString(): String {
        let alternativeBlockString: String = this.alternative == null ? "" : `else ${this.alternative.toString()}`;
        return `if ${this.condition.toString()} ${this.consequence.toString()} ${alternativeBlockString}`;
    }
}

export class FunctionLiteral implements Expression {
    token: token.Token;
    parameters: [Identifier];
    body: BlockStatement;

    constructor(t: token.Token, p: [Identifier], b: BlockStatement) {
        this.token = t;
        this.parameters = p;
        this.body = b;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): String {
        return this.token.literal;
    }

    public toString(): String {
        let parameterString: String = this.parameters.map((id) => id.toString()).join(", ");
        return `${this.token.literal}(${parameterString})${this.body.toString()}`;
    }
}

export class CallExpression implements Expression {
    token: token.Token;
    func: Expression;
    arguments: [Expression];

    constructor(t: token.Token, f: Expression, a: [Expression]) {
        this.token = t;
        this.func = f;
        this.arguments = a;
    }

    public expressionNode(): void {
        throw new Error("Method not implemented.");
    }

    public TokenLiteral(): String {
        return this.token.literal;
    }

    public toString(): String {
        let argumentString: String = this.arguments.map((ex) => ex.toString()).join(", ");
        return `${this.func.toString()}(${argumentString})`;
    }
}

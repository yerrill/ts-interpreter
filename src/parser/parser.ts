import * as lexer from "../lexer/lexer";
import * as token from "../token/token";
import * as ast from "../ast/ast";

type prefixParseFn = () => ast.Expression;
type infixParseFn = (a: ast.Expression) => ast.Expression;

enum Priority {
    LOWEST = 0,
    EQUALS = 1,
    LESSGREATER = 2,
    SUM = 3,
    PRODUCT = 4,
    PREFIX = 5,
    CALL = 6
}

const precedences: Map<token.TokenType, Priority> = new Map([
    [token.EQ, Priority.EQUALS],
	[token.NOT_EQ, Priority.EQUALS],
	[token.LT, Priority.LESSGREATER],
	[token.GT, Priority.LESSGREATER],
	[token.PLUS, Priority.SUM],
	[token.MINUS, Priority.SUM],
	[token.SLASH, Priority.PRODUCT],
	[token.ASTERISK, Priority.PRODUCT],
	[token.LPAREN, Priority.CALL],
]);

export class Parser {
    private l: lexer.Lexer;
    private errors: string[];

    private curToken: token.Token;
    private peekToken: token.Token;

    private prefixParseFns: Map<token.TokenType, prefixParseFn>;
    private infixParseFns: Map<token.TokenType, infixParseFn>;


    constructor(lexer: lexer.Lexer) {
        this.l = lexer;
        this.errors = [];

        this.prefixParseFns = new Map();
        this.registerPrefix(token.IDENT, this.parseIdentifier);
        this.registerPrefix(token.INT, this.parseIntegerLiteral);
        this.registerPrefix(token.BANG, this.parsePrefixExpression);
        this.registerPrefix(token.MINUS, this.parsePrefixExpression);
        this.registerPrefix(token.TRUE, this.parseBoolean);
        this.registerPrefix(token.FALSE, this.parseBoolean);
        this.registerPrefix(token.LPAREN, this.parseGroupedExpression);
        this.registerPrefix(token.IF, this.parseIfExpression);
        this.registerPrefix(token.FUNCTION, this.parseFunctionLiteral);
    
        this.infixParseFns = new Map();
        this.registerInfix(token.PLUS, this.parseInfixExpression);
        this.registerInfix(token.MINUS, this.parseInfixExpression);
        this.registerInfix(token.SLASH, this.parseInfixExpression);
        this.registerInfix(token.ASTERISK, this.parseInfixExpression);
        this.registerInfix(token.EQ, this.parseInfixExpression);
        this.registerInfix(token.NOT_EQ, this.parseInfixExpression);
        this.registerInfix(token.LT, this.parseInfixExpression);
        this.registerInfix(token.GT, this.parseInfixExpression);
    
        this.registerInfix(token.LPAREN, this.parseCallExpression);

        this.curToken = token.createToken("START", token.SEMICOLON);
        this.peekToken = token.createToken("PEEK", token.SEMICOLON);
        this.nextToken();
        this.nextToken();
    }

    private nextToken(): void {
        this.curToken = this.peekToken;
        this.peekToken = this.l.nextToken();
    }

    private registerPrefix(t: token.TokenType, f: prefixParseFn): void {
        this.prefixParseFns.set(t, f);
    }

    private registerInfix(t: token.TokenType, f: infixParseFn) {
        this.infixParseFns.set(t, f);
    }

    private curTokenIs(t: token.TokenType): boolean {
        return this.curToken.type == t;
    }

    private peekTokenIs(t: token.TokenType): boolean {
        return this.peekToken.type == t;
    }

    private expectPeek(t: token.TokenType): boolean {
        if ( this.peekTokenIs(t) ) {
            this.nextToken();
            return true;
        } else {
            this.peekError(t);
            return false;
        }
    }

    get error(): string[] {
        return this.errors;
    }

    private peekError(expectedToken: token.TokenType): void {
        this.errors.push(`Expected token ${expectedToken}, but got ${this.peekToken.type}`);
    }

    private noPrefixParseFnError(t: token.TokenType): void {
        this.errors.push(`No prefix parse function for ${t} found`);
    }

    public parseProgram(): ast.Program {
        let program: ast.Program = new ast.Program([]);

        while (!this.curTokenIs(token.EOF)) {
            let stmt: ast.Statement | null = this.parseStatement();

            if (stmt != null) {
                program.statements.push(stmt);
            }
            this.nextToken();
        }
        
        return program;
    }

    private parseStatement(): ast.Statement | null {
        switch (this.curToken.type) {
            case token.LET:
                return this.parseLetStatement();

            case token.RETURN:
                return this.parseReturnStatement();
            
            case token.SEMICOLON:
                return null

            default:
                return this.parseExpressionStatement();
        }
    }

    private parseLetStatement(): ast.Statement {
        let initialToken: token.Token = this.curToken;

        if (!this.expectPeek(token.IDENT)) {
            return new ast.ErrorStatement(this.curToken);
        }

        let identifierNode: ast.Identifier = new ast.Identifier(this.curToken, this.curToken.literal);

        if (!this.expectPeek(token.ASSIGN)) {
            return new ast.ErrorStatement(this.curToken);
        }

        this.nextToken();

        let value = this.parseExpression(Priority.LOWEST);

        if (this.peekTokenIs(token.SEMICOLON)) {
            this.nextToken();
        }

        return new ast.LetStatement(initialToken, identifierNode, value);
    }

    private parseReturnStatement(): ast.Statement {
        let t: token.Token = this.curToken;

        this.nextToken();

        let exp = this.parseExpression(Priority.LOWEST);

        if (this.peekTokenIs(token.SEMICOLON)) {
            this.nextToken();
        }

        return new ast.ReturnStatement(t, exp);
    }

    private parseExpressionStatement(): ast.Statement {
        let t: token.Token = this.curToken;

        let exp = this.parseExpression(Priority.LOWEST);

        if (this.peekTokenIs(token.SEMICOLON)) {
            this.nextToken();
        }

        return new ast.ExpressionStatement(t, exp);
    }

    private parseBlockStatement(): ast.BlockStatement {
        let t: token.Token = this.curToken;
        let stmts: ast.Statement[] = [];

        this.nextToken();

        while (!this.curTokenIs(token.RBRACE) && !this.curTokenIs(token.EOF)) {
            let stmt: ast.Statement | null = this.parseStatement();
            if (stmt != null) {
                stmts.push(stmt);
            }
            this.nextToken();
        }

        return new ast.BlockStatement(t, stmts);
    }

    private parseExpression(precedence: Priority): ast.Expression {
        let prefix: prefixParseFn | undefined = this.prefixParseFns.get(this.curToken.type);

        if (prefix == undefined) {
            this.noPrefixParseFnError(this.curToken.type)
            return new ast.ErrorExpression(this.curToken, undefined, "No Prefix Parse Fn");
        }

        let leftExp: ast.Expression = (prefix.bind(this))();

        while (!this.peekTokenIs(token.SEMICOLON) && precedence < this.peekPrecedence()) {
            let infix: infixParseFn | undefined = this.infixParseFns.get(this.peekToken.type);

            if (infix == undefined) {
                return leftExp;
            }

            this.nextToken();
            leftExp = (infix.bind(this))(leftExp);
        }

        return leftExp;
    }

    private peekPrecedence(): Priority {
        let precedence: Priority | undefined = precedences.get(this.peekToken.type);

        if (precedence == undefined) {
            return Priority.LOWEST;
        }

        return precedence;
    }

    private curPrecedence(): Priority {
        let precedence: Priority | undefined = precedences.get(this.curToken.type);

        if (precedence == undefined) {
            return Priority.LOWEST;
        }

        return precedence;
    }

    private parseIdentifier(): ast.Expression {
        return new ast.Identifier(this.curToken, this.curToken.literal);
    }

    private parseIntegerLiteral(): ast.Expression {
        let value = parseFloat(this.curToken.literal);

        // Error checking?

        return new ast.IntegerLiteral(this.curToken, value);
    }

    private parsePrefixExpression(): ast.Expression {
        let tok = this.curToken;
        let operator = this.curToken.literal;

        this.nextToken();

        let right = this.parseExpression(Priority.PREFIX);

        return new ast.PrefixExpression(tok, operator, right);
    }

    private parseInfixExpression(left: ast.Expression): ast.Expression {
        let tok = this.curToken;
        let operator = this.curToken.literal;

        let precedence = this.curPrecedence();
        this.nextToken();
        let right = this.parseExpression(precedence);

        return new ast.InfixExpression(left, tok, operator, right);
    }

    private parseBoolean(): ast.Expression {
        return new ast.BooleanLiteral(this.curToken, this.curTokenIs(token.TRUE));
    }

    private parseGroupedExpression(): ast.Expression {
        this.nextToken();

        let exp = this.parseExpression(Priority.LOWEST);

        if (!this.expectPeek(token.LPAREN)) {
            return new ast.ErrorExpression(this.curToken);
        }

        return exp;
    }

    private parseIfExpression(): ast.Expression {
        let tok = this.curToken;

        if (!this.expectPeek(token.LPAREN)) {
            return new ast.ErrorExpression(this.peekToken, token.LPAREN);
        }

        this.nextToken();
        let condition = this.parseExpression(Priority.LOWEST);

        if (!this.expectPeek(token.RPAREN)) {
            return new ast.ErrorExpression(this.peekToken, token.RPAREN);
        }

        if (!this.expectPeek(token.LBRACE)) {
            return new ast.ErrorExpression(this.peekToken, token.LBRACE);
        }

        let consequence = this.parseBlockStatement();
        let alternateConsequence;

        if (this.peekTokenIs(token.ELSE)) {
            this.nextToken();

            if (!this.expectPeek(token.LBRACE)) {
                return new ast.ErrorExpression(this.peekToken, token.LBRACE);
            }

            alternateConsequence = this.parseBlockStatement();
        }

        return new ast.IfExpression(tok, condition, consequence, alternateConsequence);
    }

    private parseFunctionLiteral(): ast.Expression {
        let tok = this.curToken;

        if (!this.expectPeek(token.LPAREN)) {
            return new ast.ErrorExpression(this.peekToken, token.LPAREN);
        }

        let parameters = this.parseFunctionParameters();

        if (!this.expectPeek(token.LBRACE)) {
            return new ast.ErrorExpression(this.peekToken, token.LBRACE);
        }

        let body = this.parseBlockStatement();

        return new ast.FunctionLiteral(tok, parameters, body);
    }

    private parseFunctionParameters(): ast.Identifier[] {
        let identifiers: ast.Identifier[] = [];

        if (this.peekTokenIs(token.RPAREN)) {
            this.nextToken();
            return identifiers;
        }

        this.nextToken();

        let ident = new ast.Identifier(this.curToken, this.curToken.literal);
        identifiers.push(ident);

        while (this.peekTokenIs(token.COMMA)) {
            this.nextToken();
            this.nextToken();
            ident = new ast.Identifier(this.curToken, this.curToken.literal);
            identifiers.push(ident);
        }

        if (!this.expectPeek(token.RPAREN)) {
            return [];
        }

        return identifiers;
    }

    private parseCallExpression(func: ast.Expression): ast.Expression {
        return new ast.CallExpression(this.curToken, func, this.parseCallArguments());
    }

    private parseCallArguments(): ast.Expression[] {
        let args: ast.Expression[] = [];

        if (this.peekTokenIs(token.RPAREN)) {
            this.nextToken();
            return args
        }

        this.nextToken();
        args.push(this.parseExpression(Priority.LOWEST));

        while (this.peekTokenIs(token.COMMA)) {
            this.nextToken();
            this.nextToken();
            args.push(this.parseExpression(Priority.LOWEST));
        }

        if (!this.expectPeek(token.RPAREN)) {
            return [];
        }

        return args;
    }
}
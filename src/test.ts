import * as token from "./token/token";
import * as lexer from "./lexer/lexer";
import * as ast from "./ast/ast";
import * as parser from "./parser/parser";
import * as environment from "./object/environment";
import * as object from "./object/object";
import * as evaluator from "./evaluator/evaluator";

interface TestCase {
    Test(): [any, boolean];
    toString(): string;
}


const TEST_PROGRAM_1 = "let abc = 1\
let def = 2\
let hij = 3\
\
let addmult = fnc(x, y, z) {\
    return x + y * z + 2\
} \
\
addmult(abc, def, hij)"

const TEST_PROGRAM = "if (abc) {abc} else { 1*2+9/4--2 }"

function TestTokenizer(): void {
    let expectedTokens: token.Token[] = [{type: token.LET, literal: "let"}, {type: token.IDENT, literal: "val1"},
     {type: token.ASSIGN, literal: "="}, {type: token.INT, literal: "1"}, {type: token.LET, literal: "let"},
     {type: token.IDENT, literal: "val2"}, {type: token.ASSIGN, literal: "="}, {type: token.INT, literal: "2"}, 
     {type: token.LET, literal: "let"}, {type: token.IDENT, literal: "val3"}, {type: token.ASSIGN, literal: "="}, 
     {type: token.INT, literal: "3"}, {type: token.FUNCTION, literal: "fnc"}, {type: token.IDENT, literal: "addmult"},
     {type: token.LPAREN, literal: "("}, {type: token.IDENT, literal: "x"}, {type: token.COMMA, literal: ","},
     {type: token.IDENT, literal: "y"}, {type: token.COMMA, literal: ","}, {type: token.IDENT, literal: "z"},
     {type: token.RPAREN, literal: ")"}, {type: token.LBRACE, literal: "{"}, {type: token.RETURN, literal: "RETURN"},
     {type: token.IDENT, literal: "x"}, {type: token.PLUS, literal: "+"}, {type: token.IDENT, literal: "y"},
     {type: token.ASTERISK, literal: "*"}, {type: token.IDENT, literal: "z"}, {type: token.RBRACE, literal: "}"},
     {type: token.IDENT, literal: "addmult"}, {type: token.LPAREN, literal: "("}, {type: token.IDENT, literal: "val1"},
     {type: token.COMMA, literal: ","}, {type: token.IDENT, literal: "val2"}, {type: token.COMMA, literal: ","}, 
     {type: token.IDENT, literal: "val3"}, {type: token.RPAREN, literal: ")"}, {type: token.PLUS_EQ, literal: "+="},
     {type: token.MINUS_EQ, literal: "-="}, {type: token.AST_EQ, literal: "*="}, {type: token.SLASH_EQ, literal: "/="},
     {type: token.LT, literal: "<"}, {type: token.GT, literal: ">"}, {type: token.LT_EQ, literal: "<="},
     {type: token.GT_EQ, literal: ">="}, {type: token.EQ, literal: "=="}, {type: token.NOT_EQ, literal: "!="}, {type: token.MOD, literal: "%"}];

    let tokenizer = new lexer.Lexer(TEST_PROGRAM);
    let currentToken: token.Token;
    let status: boolean = true;
    
    for (let i in expectedTokens) {
        currentToken = tokenizer.nextToken();
        
        status = status && ( expectedTokens[i].type == currentToken.type );
        !status ? console.log(expectedTokens[i], "-", currentToken) : null;
    }

    console.log(`TestTokenizer() resulted ${status}`);
}

function TestParser(): void {
    let tokenizer = new lexer.Lexer(TEST_PROGRAM);
    let parserly = new parser.Parser(tokenizer);

    let tree = parserly.parseProgram();

    let result = tree.toString();
    console.log(result);
    console.log(parserly.error)
}

class EvalTestCase implements TestCase{
    private testProgram: string;
    private expected: any;

    constructor(testProgram: string, expected: any) {
        this.testProgram = testProgram;
        this.expected = expected;
    }

    Test(): [object.Object | null, boolean] {
        let l: lexer.Lexer = new lexer.Lexer(this.testProgram);
        let p: parser.Parser = new parser.Parser(l);
        let program: ast.Program = p.parseProgram();
        let env: environment.Environment = environment.newEnvironment();

        let result: object.Object | null = evaluator.Eval(program, env);

        //console.log(program.statements[0].toString());
        return [result, result?.Value() == this.expected];
    }

    toString(): string {
        let [testObj, testResult] = this.Test();
        return `(${this.testProgram.slice(0, 50)}) >> ${this.expected?.toString()} >> ${testResult ? "SUCCESS" : "FAIL"}(${testObj?.Value()})`;
    }
}

function TestEval(): void {
    let cases: TestCase[] = [
        new EvalTestCase("1", 1),
        new EvalTestCase("true", true),
        new EvalTestCase("false", false),
        new EvalTestCase("-2", -2),
        new EvalTestCase("--2", 2),
        new EvalTestCase("---2", -2),
        new EvalTestCase("!true", false),
        new EvalTestCase("!false", true),
        new EvalTestCase("!5", false),
        new EvalTestCase("!!5", true),
        new EvalTestCase("!", false),
        new EvalTestCase("!!", true),
        new EvalTestCase("!-5", false),
        new EvalTestCase("5 + 5 + 5 + 5 - 10", 10),
		new EvalTestCase("2 * 2 * 2 * 2 * 2", 32),
		new EvalTestCase("-50 + 100 + -50", 0),
		new EvalTestCase("5 * 2 + 10", 20),
		new EvalTestCase("5 + 2 * 10", 25),
		new EvalTestCase("20 + 2 * -10", 0),
		new EvalTestCase("50 / 2 * 2 + 10", 60),
		new EvalTestCase("2 * (5 + 10)", 30),
		new EvalTestCase("3 * 3 * 3 + 10", 37),
		new EvalTestCase("3 * (3 * 3) + 10", 37),
		new EvalTestCase("(5 + 10 * 2 + 15 / 3) * 2 + -10", 50),
        new EvalTestCase("1 < 2", true),
        new EvalTestCase("1 > 2", false),
        new EvalTestCase("1 < 1", false),
        new EvalTestCase("1 > 1", false),
        new EvalTestCase("1 == 1", true),
        new EvalTestCase("1 != 1", false),
        new EvalTestCase("1 == 2", false),
        new EvalTestCase("1 != 2", true),
        new EvalTestCase("(1 == 2) == false", true),
        new EvalTestCase("(1 == 2) == true", false),
        new EvalTestCase("if (true) { 10 }", 10),
        new EvalTestCase("if (false) { 10 }", null),
        new EvalTestCase("if (1) { 10 }", 10),
        new EvalTestCase("if (1 < 2) { 10 }", 10),
        new EvalTestCase("if (1 > 2) { 10 }", null),
        new EvalTestCase("if (1 > 2) { 10 } else { 20 }", 20),
        new EvalTestCase("if (1 < 2) { 10 } else { 20 }", 10),
        new EvalTestCase("if ((1000 / 2) + 250 * 2 == 1000) { 9999 }", 9999),
        new EvalTestCase("return 10;", 10),
		new EvalTestCase("return 10; 9;", 10),
		new EvalTestCase("return 2 * 5; 9;", 10),
		new EvalTestCase("9; return 2 * 5; 9;", 10),
		new EvalTestCase("if (10 > 1) { return 10; }", 10),
		new EvalTestCase("if (10 > 1) { if (10 > 1) { return 10; } return 1;}", 10),
		new EvalTestCase("let f = fn(x) { return x; x + 10; }; f(10);", 10),
		new EvalTestCase("let f = fn(x) {let result = x + 10;return result;return 10;};f(10);", 20),
        new EvalTestCase("let fib = fn(n) {if (n == 0) {return 0} if (n == 1) {return 1} if (n > 1) {fib(n - 1) + fib(n - 2)}} fib(10)", 55),
        new EvalTestCase("fn(x) {x + 1}(1)", 2),
        new EvalTestCase("fn(x) {fn (y) {x * y + 1}}(1)(2)", 3),
    ];
    
    cases.map((v, i) => console.log(`Case ${i + 1} :: ${v.toString()}`));
}

//TestTokenizer();
//TestParser();
TestEval();
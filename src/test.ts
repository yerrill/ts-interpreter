import * as token from "./token/token";
import * as lexer from "./lexer/lexer";


const TEST_PROGRAM = "let val1 = 1\
let val2 = 2\
let val3 = 3\
\
fnc addmult(x, y, z) {\
    return x + y * z\
}\
\
addmult(val1, val2, val3)"

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
     {type: token.IDENT, literal: "val3"}, {type: token.RPAREN, literal: ")"}];



     for (let expectedToken in expectedTokens) {

     }
}


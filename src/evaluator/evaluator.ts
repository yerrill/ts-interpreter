import * as ast from '../ast/ast';
import * as obj from '../object/object';
import * as env from '../object/environment';

export const NULL = new obj.Null();
export const TRUE = new obj.Boolean(true);
export const FALSE = new obj.Boolean(false);

function nativeBoolToBooleanObject(input: boolean): obj.Object {
    if (input) {
        return TRUE;
    } else {
        return FALSE;
    }
}

function isError(object: obj.Object): boolean {
    return object.Type() == obj.ObjectType.ERROR_OBJ;
}

export function Eval(node: ast.Node, env: env.Environment): obj.Object | null {
    
    if (node instanceof ast.Program) { // Would like to use a switch here but it seems to not be possible
        return evalProgram(node, env);
    } 
    else if (node instanceof ast.BlockStatement) {
        throw new Error("Not Implemented");
    } 
    else if (node instanceof ast.ExpressionStatement) {
        return Eval(node.value, env);
    } 
    else if (node instanceof ast.ReturnStatement) {
        throw new Error("Not Implemented");
    } 
    else if (node instanceof ast.LetStatement) {
        throw new Error("Not Implemented");
    }

    // Expressions

    else if (node instanceof ast.IntegerLiteral) {
        return new obj.Integer(node.value);
    }
    else if (node instanceof ast.BooleanLiteral) {
        return nativeBoolToBooleanObject(node.value);
    }
    else if (node instanceof ast.PrefixExpression) {
        let right: obj.Object | null = Eval(node.right, env);

        if (right != null && isError(right)) { // HDTW: null checking like this in type system
            return right;
        }
        return evalPrefixExpression(node.operator, right);
    }

    //return newError(`No Eval Branch ${node.toString()}`);
    //return NULL;
    return null
}

function evalProgram(program: ast.Program, env: env.Environment): obj.Object | null {
    let result: obj.Object | null = newError("No Statments in Program node");

    for (let index in program.statements) {
        result = Eval(program.statements[index], env);

        if (result instanceof obj.ReturnValue) {
            return result.value;
        } else if (result instanceof obj.Error) {
            return result;
        }
    }

    return result;
}

function evalPrefixExpression(operator: string, right: obj.Object | null): obj.Object {
    switch(operator) {
        case "!":
            return evalBangOperatorExpression(right);

        case "-":
            return evalMinusOperatorExpression(right)

        default:
            return newError(`Unknown operator: ${operator} ${right?.Type()}`);
    }
}

function evalBangOperatorExpression(right: obj.Object | null): obj.Object {
    switch(right) {
        case TRUE:
            return FALSE;
        case FALSE:
            return TRUE;
        case NULL:
            return TRUE;
        default:
            return FALSE
    }
}

function evalMinusOperatorExpression(right: obj.Object | null): obj.Object {
    if (right == null || right.Type() != obj.ObjectType.INTEGER_OBJ) {
        return newError(`Unknown operator -${right?.Type()}`);
    }

    let value = right.Value();
    return new obj.Integer(-value);
}

function newError(msg: string): obj.Error {
    return new obj.Error(msg);
}


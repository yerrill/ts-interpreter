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

function isError(object: obj.Object | null): boolean {
    if (object != null) {
        return object.Type() == obj.ObjectType.ERROR_OBJ;
    }
    return false;
}

export function Eval(node: ast.Node, env: env.Environment): obj.Object | null {
    
    if (node instanceof ast.Program) { // Would like to use a switch here but it seems to not be possible
        return evalProgram(node, env);
    }
    else if (node instanceof ast.BlockStatement) {
        return evalBlockStatement(node, env);
    }
    else if (node instanceof ast.ExpressionStatement) {
        return Eval(node.value, env);
    }
    else if (node instanceof ast.ReturnStatement) {
        let val = Eval(node.value, env)
		if (isError(val)) {
			return val
		}
        if (val == null) {
            return NULL;
        }
		return new obj.ReturnValue(val);
    }
    else if (node instanceof ast.LetStatement) {
        let val = Eval(node.value, env);
        if (isError(val)) {
            return val;
        }
        if (val == null) {
            val = NULL;
        }
        env.set(node.name.name, val);
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

        if (isError(right)) { // HDTW: null checking like this in type system
            return right;
        }
        return evalPrefixExpression(node.operator, right);
    }
    else if (node instanceof ast.InfixExpression) {
        let left = Eval(node.left, env);
        if (left == null || isError(left)) {
            return left;
        }
        let right = Eval(node.right, env);
        if (right == null || isError(right)) {
            return right;
        }

        return evalInfixExpression(node.operator, left, right);
    }
    else if (node instanceof ast.IfExpression) {
        return evalIfExpression(node, env);
    }
    else if (node instanceof ast.Identifier) {
        return evalIdentifier(node, env);
    }
    else if (node instanceof ast.FunctionLiteral) {
        return new obj.Function(node.parameters, node.body, env);
    }
    else if (node instanceof ast.CallExpression) {
        let func = Eval(node.func, env);
        if (func == null || isError(func)) {
            return func;
        }

        let args = evalExpressions(node.arguments, env);
        if (args.length == 1 && isError(args[0])) {
            return args[0];
        }

        if (func instanceof obj.Function) {
            return applyFunction(func, args);
        } else {
            return newError(`Not a function: ${func.Type()}`);
        }

        
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

function evalBlockStatement(block: ast.BlockStatement, env: env.Environment): obj.Object | null {
    let result: obj.Object | null = null;

    for (let index in block.statements) {
        result = Eval(block.statements[index], env);

        if (result != null && 
            (result.Type() == obj.ObjectType.RETURN_VALUE_OBJ || result.Type() == obj.ObjectType.ERROR_OBJ)) {
            
            return result;
        }
    }

	return result
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

function evalInfixExpression(operator: string, right: obj.Object, left: obj.Object): obj.Object {
    if (left instanceof obj.Integer && right instanceof obj.Integer) {
        //left.Type() == obj.ObjectType.INTEGER_OBJ && right.Type() == obj.ObjectType.INTEGER_OBJ
        return evalIntegerInfixExpression(operator, left, right)
    }
    else if (operator == "==") {
		return nativeBoolToBooleanObject(left == right)
    }
	else if (operator == "!=") {
		return nativeBoolToBooleanObject(left != right)
    }
    else if (left.Type() != right.Type()) {
		return newError(`type mismatch: ${left.Type()}, ${operator}, ${right.Type()}`);
    }
	else {
		return newError(`unknown operator: ${left.Type()}, ${operator}, ${right.Type()}`);
	}
}

function evalIntegerInfixExpression(operator: string, right: obj.Integer, left: obj.Integer): obj.Object {
    switch (operator) {
        case "+":
            return new obj.Integer(left.value + right.value);
        case "-":
            return new obj.Integer(left.value - right.value);
        case "*":
            return new obj.Integer(left.value * right.value);
        case "/":
            return new obj.Integer(left.value / right.value);
        case "<":
            return nativeBoolToBooleanObject(left.value < right.value);
        case ">":
            return nativeBoolToBooleanObject(left.value > right.value);
        case "<=":
            return nativeBoolToBooleanObject(left.value <= right.value);
        case ">=":
            return nativeBoolToBooleanObject(left.value >= right.value);
        case "==":
            return nativeBoolToBooleanObject(left.value == right.value);
        case "!=":
            return nativeBoolToBooleanObject(left.value != right.value);
        default:
            return newError(`unknown operator: ${left.Type()}, ${operator}, ${right.Type()}`);
        }
}

function evalIfExpression(ie: ast.IfExpression, env: env.Environment): obj.Object | null {
	let condition = Eval(ie.condition, env);

	if (isError(condition)) {
		return condition
	}

	if (condition != null && isTruthy(condition)) {
		return Eval(ie.consequence, env)
	} else if (ie.alternative != null){
		return Eval(ie.alternative, env)
	} else {
		return NULL
	}
}

function evalIdentifier(node: ast.Identifier, env: env.Environment): obj.Object {
	let val = env.get(node.name);
	if (val == null) {
		return newError(`identifier not found: ${node.name}`);
	}

	return val
}

function isTruthy(ob: obj.Object): boolean {
	switch (ob) {
	    case NULL:
		    return false
	    case TRUE:
		    return true
	    case FALSE:
		    return false
	    default:
		    return true
	}
}

function newError(msg: string): obj.Error {
    return new obj.Error(msg);
}

function evalExpressions(exps: ast.Expression[], env: env.Environment): obj.Object[] {
    let result: obj.Object[];

    result = exps.map((exp, i, a) => {
        let evaluated = Eval(exp, env);
        if (evaluated == null || isError(evaluated)) {
            return NULL;
        } else {
            return evaluated;
        }
    });

    return result;
}

function applyFunction(func: obj.Function, args: obj.Object[]): obj.Object | null {
    let extendedEnv = extendFunctionEnv(func, args);
    let evaluated = Eval(func.body, extendedEnv);
    return unwrapReturnValue(evaluated);
}

function extendFunctionEnv(fn: obj.Function, args: obj.Object[]): env.Environment {
	let newEnv = env.newEnclosedEnvironment(fn.env);
    fn.parameters.map((v, i) => newEnv.set(v.name, args[i]));
	return newEnv
}

function unwrapReturnValue(ob: obj.Object | null): obj.Object | null {
    if (ob instanceof obj.ReturnValue) {
        return ob.Value();
    }

	return ob;
}
import * as ast from '../ast/ast';
import * as env from './environment';

export enum ObjectType {
    NULL_OBJ = "NULL",
    ERROR_OBJ = "ERROR",

    INTEGER_OBJ = "INTEGER",
    BOOLEAN_OBJ = "BOOLEAN",

    RETURN_VALUE_OBJ = "RETURN_VALUE",

    FUNCTION_OBJ = "FUNCTION"

}

export interface Object {
    Type(): ObjectType;
    Inspect(): string;
    Value(): any;
}

export class Integer implements Object {
    value: number;

    constructor(value: number) {
        this.value = value;
    }

    Type(): ObjectType {
        return ObjectType.INTEGER_OBJ;
    }

    Inspect(): string {
        return `${this.value}`;
    }

    Value(): number {
        return this.value;
    }
}

export class Boolean implements Object {
    value: boolean;

    constructor(value: boolean) {
        this.value = value;
    }

    Type(): ObjectType {
        return ObjectType.BOOLEAN_OBJ;
    }
    Inspect(): string {
        return `${this.value}`
    }

    Value(): boolean {
        return this.value;
    }
    
}

export class Null implements Object {
    Type(): ObjectType {
        return ObjectType.NULL_OBJ;
    }

    Inspect(): string {
        return "Null";
    }
    
    Value(): null {
        return null;
    }
}

export class ReturnValue implements Object {
    value: Object;

    constructor(value: Object) {
        this.value = value;
    }

    Type(): ObjectType {
        return ObjectType.RETURN_VALUE_OBJ;
    }

    Inspect(): string {
        return this.value.Inspect();
    }

    Value(): Object {
        return this.value;
    }    
}

export class Error implements Object {
    message: string;

    constructor(msg: string) {
        this.message = msg;
    }

    Type(): ObjectType {
        return ObjectType.ERROR_OBJ;
    }

    Inspect(): string {
        return `Error '${this.message}'`;
    }

    Value(): string {
        return this.Inspect();
    }
}

export class Function implements Object {
    parameters: ast.Identifier[];
    body: ast.BlockStatement;
    env: env.Environment;

    constructor(parameters: ast.Identifier[], body: ast.BlockStatement, env: env.Environment) {
        this.parameters = parameters;
        this.body = body;
        this.env = env;
    }

    Type(): ObjectType {
        return ObjectType.FUNCTION_OBJ;
    }

    Inspect(): string {
        let paramsString: string = this.parameters.map((p) => p.toString()).join(", ");

        return `fn(${paramsString}) {\n${this.body.toString()}\n}`;
    }

    Value(): null {
        return null;
    }
}

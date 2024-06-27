import * as obj from './object';


export class Environment {
    private store: Map<string, obj.Object>;
    private outer: Environment | null;

    constructor(outer: Environment | null) {
        this.store = new Map();
        this.outer = outer;
    }

    public get(name: string): obj.Object | null {
        let mapVal: obj.Object | undefined = this.store.get(name);
        let val: obj.Object | null = mapVal == undefined ? null : mapVal; // ew

        if (val == null && this.outer != null) {
            val = this.outer.get(name);
        }

        return val;
    }

    public set(name: string, val: obj.Object): obj.Object {
        this.store.set(name, val);
        return val;
    }
}

export function newEnclosedEnvironment(outer: Environment): Environment {
    return new Environment(outer);
}

export function newEnvironment(): Environment {
    return new Environment(null);
}


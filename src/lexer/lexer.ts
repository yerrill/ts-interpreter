import * as token from "../token/token";

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
    }

    get state(): string {
        return `position: ${this.position}, nextPosition: ${this.nextPosition}, ch: ${this.ch}`;
    }

    private get len(): number {
        return this.input.length;
    }

    readChar(): void { // Advance character state of the object
        if (this.nextPosition >= this.len) {
            this.ch = '\0';
        } else {
            this.ch = this.input[this.nextPosition];
        }

        this.position = this.nextPosition;
        this.nextPosition += 1;
    }

    nextToken(): token.Token {
        switch(this.ch) {
            case ''
        }
    }

}
import {Unit} from "./Unit.js";

export class Range extends Unit{
    constructor(...args: any[]) {
        super(args[0], args[1], args[2]);
    }
}
import {Unit} from "./Unit.js";

export class Melee extends Unit{
    constructor(...args: any[]) {
        super(args[0], args[1], args[2], args[3], args[4], args[5]);
    }
}
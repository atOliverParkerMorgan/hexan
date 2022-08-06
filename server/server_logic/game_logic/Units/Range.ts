import {Unit, UnitInitData} from "./Unit";

class Range extends Unit{
    public readonly PRODUCTION_TIME: number = 10_000;
    public static readonly SLINGER: UnitInitData = {
        attack: 10,
        health: 100,
        range: 2,
        movement: 120,

        type: "RANGE"
    }
    constructor(...args: any[]) {
        super(args[0], args[1], args[2], args[3]);
    }
}

export default Range;
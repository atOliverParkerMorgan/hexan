import {Unit, UnitInitData} from "./Unit";
import Cavalry from "./Cavalry";

class Range extends Unit{
    public readonly PRODUCTION_TIME: number = 10_000;
    public static readonly SLINGER: UnitInitData = {
        attack: 10,
        health: 100,
        range: 2,
        movement: 12,

        type: "Range"
    }
    constructor(...args: any[]) {
        super(args[0], args[1], args[2], args[3]);
    }
}

export default Range;
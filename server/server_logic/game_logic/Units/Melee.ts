import {Unit, UnitInitData} from "./Unit";

class Melee extends Unit{
    public readonly PRODUCTION_TIME: number = 10_000;
    public static readonly WARRIOR: UnitInitData = {
        attack: 25,
        health: 100,
        range: 1,
        movement: 100,
        type: "MELEE"
    }
    constructor(...args: any[]) {
        super(args[0], args[1], args[2], args[3]);

    }
}

export default Melee;
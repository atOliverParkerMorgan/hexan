import {Unit, UnitInitData} from "./Unit";

class Cavalry extends Unit{
    public readonly PRODUCTION_TIME: number = 10_000;
    public static readonly HORSEMAN: UnitInitData = {
        attack: 20,
        health: 100,
        range: 1,
        movement: 25,

        type: "Cavalry"
    }
    constructor(...args: any[]) {
        super(args[0], args[1], args[2], args[3]);
    }
}

export default Cavalry;
import {Unit} from "./Unit";
import {UnitInitData} from "./UnitInitData";
import Map from "../Map/Map";

class Range extends Unit{
    public static readonly SLINGER: UnitInitData = {
        name: "Slinger",

        attack: 10,
        health: 100,
        range: 2,
        movement: 120,
        cost: 6,

        action: Unit.FORTIFY,
        type: Unit.RANGE
    }
    public static readonly ARCHER: UnitInitData = {
        name: "Archer",

        attack: 10,
        health: 100,
        range: 2,
        movement: 120,
        cost: 6,

        action: Unit.FORTIFY,
        type: Unit.RANGE
    }
    constructor(x: number, y: number, id: string, map: Map, unit_init_data: UnitInitData) {
        super(x, y, id, map, unit_init_data);
    }
}

export default Range;
import {Unit} from "./Unit";
import Player from "../Player";
import Game from "../Game";
import {UnitInitData} from "./UnitInitData";

class Settler extends Unit{
    public static readonly SETTLER_UNIT: UnitInitData = {
        name: "Settler",

        attack: 0,
        health: 100,
        range: 0,
        movement: 100,
        cost: 20,

        action: Unit.SETTLE,
        type: Unit.SETTLER
    }

    constructor(x: number, y: number, id: string) {
        super(x, y, id, Settler.SETTLER_UNIT);
    }

    settle(owner: Player, game: Game): void{
        const city_node = game.map.get_node(super.get_x(), super.get_y());
        if(city_node == null) return

        game.add_city(owner, city_node);
    }

    can_settle(): boolean{
        return true;
    }

}

export default Settler;
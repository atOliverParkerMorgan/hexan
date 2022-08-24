import {Unit, UnitInitData} from "./Unit";
import Player from "../Player";
import Game from "../Game";
import Range from "./Range";

class Settler extends Unit{
    public readonly PRODUCTION_TIME: number = 10_000;

    constructor(x: number, y: number, id: string) {
        super(x, y, id, {
            attack: 0,
            health: 100,
            range: 0,
            movement: 100,
            type: Unit.SETTLER
        });
    }

    settle(owner: Player, game: Game){
        const city_node = game.map.get_node(super.get_x(), super.get_y());
        if(city_node == null) return

        game.add_city(owner, city_node);
    }

}

export default Settler;
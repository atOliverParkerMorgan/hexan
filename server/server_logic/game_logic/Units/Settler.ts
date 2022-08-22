import {Unit, UnitInitData} from "./Unit";
import Player from "../Player";
import Game from "../Game";

class Settler extends Unit{
    constructor(x: number, y: number, id: string, unit_init_data: UnitInitData) {
        super(x, y, id, unit_init_data);
    }

    settle(owner: Player, game: Game){
        const city_node = game.map.get_node(super.get_x(), super.get_y());
        if(city_node == null) return

        game.add_city(owner, city_node);
    }

}
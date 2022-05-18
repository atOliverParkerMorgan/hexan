const {Unit} = require("./Units/Unit");

class Player{
    constructor(token) {
        this.token = token;
        this.current_city_id = 0;
        this.units = [];
    }
    add_unit(x, y){
        this.units.push(new Unit(x, y));
    }
}

module.exports.Player = Player;
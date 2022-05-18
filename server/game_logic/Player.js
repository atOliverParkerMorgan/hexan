const {Unit} = require("./Units/Unit");

class Player{
    constructor(token) {
        this.token = token;
        this.units = [];
        this.current_unit_id = 0;
    }
    add_unit(x, y){
        this.units.push(new Unit(x, y, this.token+this.current_unit_id));
        this.current_unit_id ++;
    }
    get_unit(id){
        for (const unit of this.units) {
            if(unit.id === id) return unit;
        }
    }
}

module.exports.Player = Player;
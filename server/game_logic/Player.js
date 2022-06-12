// const {Unit} = require("./Units/Unit.js");

const {Melee} = require("./Units/Melee.js");
const {Range} = require("./Units/Range.js");
const {Cavalry} = require("./Units/Cavalry.js");

const MELEE = require("./Units/Unit.js").MELEE;
const CAVALRY = require("./Units/Unit.js").CAVALRY;
const RANGE = require("./Units/Unit.js").RANGE;

class Player{
    constructor(token) {
        this.token = token;
        this.units = [];
        // units that this player can produce
        this.production_unit_types = ["WARRIOR", "SLINGSHOT"]
        this.current_unit_id = 0;
    }
    add_unit(x, y, type){
        switch (type){
            case MELEE:
                this.units.push(new Melee(x, y,this.token+this.current_unit_id, type, 1500));
                break;
            case CAVALRY:
                this.units.push(new Cavalry(x, y,this.token+this.current_unit_id, type, 900));
                break;
            case RANGE:
                this.units.push(new Range(x, y,this.token+this.current_unit_id, type, 1300));
                break;
        }
        this.current_unit_id ++;
    }
    get_unit(id){
        for (const unit of this.units) {
            if(unit.id === id) return unit;
        }
    }
    // used to send simplified unit data structure threw socket.io
    get_unit_data(){
        let unit_data = [];
        for(const unit of this.units){
            unit_data.push(unit.get_data());
        }

        return unit_data;

    }
}

module.exports.Player = Player;
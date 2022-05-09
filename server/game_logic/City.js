const send_data = require("../socket").send_data;

class City{
    constructor(owner, x, y, name){
        this.owner = owner;
        this.x = x;
        this.y = y;
        this.name = name;
        this.food_per_a_minute = 20;
        this.production_per_a_minute = 10;
        this.is_producing = false;
    }

    start_production(production_time){
        if(!this.is_producing){
            this.is_producing = true
            setTimeout(this.produce, production_time);
        }
    }

    produce(){
        this.owner.units.add(new Unit(this.owner, this.x, this.y));
        this.is_producing = false;
        send_data(this.owner, {
            response_type: "UNITS",
            units: this.owner.units,
        })
    }
}

module.exports.City = City;
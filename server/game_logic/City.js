const send_data = require("../ServerSocket").send_data;

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
            this.produce(this);
            // setTimeout(this.produce.bind(null, this), production_time);
        }
    }

    produce(city){
        city.owner.add_unit(city.x, city.y);
        city.is_producing = false;
        send_data(city.owner, {
            response_type: "UNITS",
            units: city.owner.units,
        })
    }
}

module.exports.City = City;
const {ServerSocket} = require("../ServerSocket");

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

    start_production(production_time, socket, unit_type){
        if(!this.is_producing){
            this.is_producing = true
            
            setTimeout(()=> this.produce_unit_and_send_response(socket, unit_type), production_time);
        }
    }

    produce_unit_and_send_response(socket, unit_type){
        this.owner.add_unit(this.x, this.y, unit_type);

        ServerSocket.send_data(socket, {
                response_type: ServerSocket.response_types.UNITS_RESPONSE,
                data: {
                    units: this.owner.units
                }
            },
            this.owner.token);

        this.is_producing = false;
    }
}

module.exports.City = City;
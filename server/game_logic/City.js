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

    start_production(production_time, socket){
        if(!this.is_producing){
            this.is_producing = true
            
            setTimeout(()=> this.produce_and_send_response(socket), production_time);
        }
    }

    produce_and_send_response(socket){
        this.owner.add_unit(this.x, this.y);
        this.is_producing = false;

        ServerSocket.send_data(socket, {
                response_type: ServerSocket.response_types.UNITS_RESPONSE,
                data: {
                    units: this.owner.units
                }
            },
            this.owner.token);
    }
}

module.exports.City = City;
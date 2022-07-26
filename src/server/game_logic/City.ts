import Player from "./Player";
import {Socket} from "socket.io";

const {ServerSocket} = require("../ServerSocket");

class City{
    public readonly owner: Player;
    public readonly x: number;
    public readonly y: number;
    public readonly name: string;
    food_per_a_minute: number;
    production_per_a_minute: number;
    is_producing: boolean;

    constructor(owner: Player, x:number, y:number, name:string){
        this.owner = owner;
        this.x = x;
        this.y = y;
        this.name = name;
        this.food_per_a_minute = 20;
        this.production_per_a_minute = 10;
        this.is_producing = false;
    }

    start_production(production_time: number, socket: Socket, unit_type: string): void{
        if(!this.is_producing){
            this.is_producing = true
            
            setTimeout(()=> this.produce_unit_and_send_response(socket, unit_type), production_time);
        }
    }

    produce_unit_and_send_response(socket: Socket, unit_type: string): void{
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

export default City;
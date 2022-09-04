import Player from "./Player";
import {Socket} from "socket.io";
import {ServerSocket} from "../ServerSocket";
import Map from "./Map/Map";
import {Node} from "./Map/Node";
import {Unit} from "./Units/Unit";
import {Utils} from "../../Utils";

class City{
    private static city_names = [
        "Ebalfast", "Utraapfield", "Chaitville", "Fusey", "Lipmore", "Shodon", "Doria", "Slaso", "Oriason", "Adadale",
        "Naifcaster", "Duldo", "Paxfield", "Klostead", "Slomery", "Tranbu", "Modon", "Srane", "Asobridge", "Ouverdale",
        "Graetol", "Qowell", "Bashire", "Dreport", "Vlausver", "Hanta", "Wragos", "Zrolk", "Itarora", "Oniling",
        "Acluybridge", "Ylusmont", "Krophis", "Vustin", "Quevine", "Stroria", "Qraso", "Qale", "Arkfast", "Andbridge",
        "Glemouth", "Wicbridge", "Okoumont", "Nefsas", "Gommore", "Kona", "Jirie", "Flario", "Egorora", "Eleyford",
        "Tuimdence", "Ibadon", "Ipretgow", "Claalginia", "Keross", "Itranbu", "Shora", "Wrolis", "Antarith", "Ouverstead",
        "Iplomwood", "Caver", "Nekta", "Vualfast", "Duapool", "Uqrares", "Nore", "Eklerton", "Ardcester", "Eimver",
        "Pheving", "Ilerith", "Gauchester", "Xahull", "Staport", "Droni", "Creles", "Phock", "Odondale", "Ullens",
        "Beuyding", "Rolland", "Qranridge", "Stephia", "Groyland", "Prin", "Nork", "Tock", "Olisving", "Asostead", "Nork",
        "Ajuapgow", "Klewood", "Qrucburg", "Facmont", "Zurora", "Lock", "Qarc", "Isleles", "Egogow", "Eighling",
        "Griphis", "Chosving", "Hokstin", "Fodset", "Khupling", "Erison", "Evlanbu", "Atrodon", "Okwell",
        "Shentol", "Shegan", "Saemond", "Tousmery", "Flaarith", "Iglane", "Vrodon", "Vralo", "Edonard", "Oragend",
        "Bucville", "Jeepving", "Higinia", "Bidiff", "Slosas", "Zlouver", "Frok", "Pita", "Arcridge", "Alepool",
        "Yrausburgh", "Evota", "Cloyvine", "Tuta", "Kloygend", "Xinas", "Ovand", "Flane", "Idobury", "Uryburgh",
        "Rohull", "Cudwood", "Vruhgow", "Trerough", "Muuburgh", "Nia", "Vlale", "Clery", "Ensmouth", "Agosmore"
    ];

    public readonly owner: Player;
    public readonly x: number;
    public readonly y: number;
    public readonly cords_in_pixels_x: number;
    public readonly cords_in_pixels_y: number;
    public readonly name: string;
    stars_per_a_minute: number;
    population: number;

    is_producing: boolean;

    constructor(owner: Player, x: number, y: number){
        this.owner = owner;

        this.x = x;
        this.y = y;
        this.cords_in_pixels_x = this.get_x_in_pixels();
        this.cords_in_pixels_y = this.get_y_in_pixels();

        this.name = City.city_names[Utils.random_int(0, City.city_names.length - 1)];
        City.city_names.splice(City.city_names.indexOf(this.name));

        this.stars_per_a_minute = 20;
        this.population = 3;
        this.is_producing = false;
    }

    start_production(production_time: number, socket: Socket, unit_type: string): void{
        if(!this.is_producing){
            this.is_producing = true
            
            setTimeout(()=> this.produce_unit_and_send_response(socket, unit_type), production_time);
        }
    }

    produce_unit_and_send_response(socket: Socket, unit_type: string): void{
        let unit: Unit = this.owner.add_unit(this.x, this.y, unit_type);
        ServerSocket.send_data(socket, {
                response_type: ServerSocket.response_types.UNIT_RESPONSE,
                data: {
                    unit: unit.get_data()
                }
            },
            this.owner.token);

        this.is_producing = false;
    }

    get_x_in_pixels(): number{
        let row_bias = this.y % 2 === 0 ? Map.DISTANCE_BETWEEN_HEX/2 : 0;
        return (this.x * Map.DISTANCE_BETWEEN_HEX + row_bias) - Map.WORLD_WIDTH / 2;
    }

    get_y_in_pixels(): number{
        return  (this.y * 1.5 * Node.HEX_SIDE_SIZE) - Map.WORLD_HEIGHT / 2;
    }

}

export default City;
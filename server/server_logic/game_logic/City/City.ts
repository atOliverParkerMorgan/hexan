import Player from "../Player";
import {Socket} from "socket.io";
import {ServerSocket} from "../../ServerSocket";
import Map from "../Map/Map";
import {Node} from "../Map/Node";
import {Unit} from "../Units/Unit";
import {Utils} from "../../../Utils";
import {CityInterface} from "./CityInterface";

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
    }

    produce_unit_and_send_response(socket: Socket, unit_name: string, map: Map): void{
        const cost: number | undefined = Utils.get_unit_cost(unit_name);
        if(cost == null) return;

        // check if payment is valid if not terminate
        if(!this.owner.is_payment_valid(cost)) {
            ServerSocket.insufficient_funds_response(socket, this.owner, 'INSUFFICIENT STARS', `You need ${Math.abs(Math.floor(this.owner.total_owned_stars - cost))} more stars to buy a ${unit_name}`)
            return;
        }
        this.owner.pay_stars(cost);

        let unit: Unit = this.owner.add_unit(this.x, this.y, unit_name, map);
        ServerSocket.send_unit_produced_response(socket, this, unit);
    }

    get_x_in_pixels(): number{
        let row_bias = this.y % 2 === 0 ? Map.DISTANCE_BETWEEN_HEX/2 : 0;
        return (this.x * Map.DISTANCE_BETWEEN_HEX + row_bias) - Map.WORLD_WIDTH / 2;
    }

    get_y_in_pixels(): number{
        return  (this.y * 1.5 * Node.HEX_SIDE_SIZE) - Map.WORLD_HEIGHT / 2;
    }

    get_data(player_token: string): CityInterface{
        return {
            x: this.x,
            y: this.y,
            cords_in_pixels_x: this.cords_in_pixels_x,
            cords_in_pixels_y: this.cords_in_pixels_y,
            name: this.name,
            stars_per_a_minute: this.stars_per_a_minute,
            population: this.population,
            is_friendly: this.owner.token === player_token
        }
    }

}

export default City;
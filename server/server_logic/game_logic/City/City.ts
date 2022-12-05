import Player from "../Player";
import {Socket} from "socket.io";
import {ServerSocket} from "../../ServerSocket";
import Map from "../Map/Map";
import {Node} from "../Map/Node";
import {Unit} from "../Units/Unit";
import {Utils} from "../../../Utils";
import {CityInterface} from "./CityInterface";
import Game from "../Game";

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

    public static readonly BASE_HARVEST_COST = 5;

    public readonly owner: Player;
    public readonly x: number;
    public readonly y: number;
    public readonly cords_in_pixels_x: number;
    public readonly cords_in_pixels_y: number;
    public readonly name: string;

    can_be_harvested_nodes: Node[];
    harvested_nodes: Node[];
    stars_per_a_minute: number;
    population: number;
    number_of_harvested_nodes: number;


    constructor(owner: Player, city_node: Node){
        this.owner = owner;

        this.x = city_node.x;
        this.y = city_node.y;
        this.cords_in_pixels_x = this.get_x_in_pixels();
        this.cords_in_pixels_y = this.get_y_in_pixels();

        this.number_of_harvested_nodes = 0;

        this.harvested_nodes = [city_node];
        this.can_be_harvested_nodes = [];

        city_node.neighbors.map((node: Node| undefined)=>{
            if(node != null && !node.is_harvested && node.city == null){
            this.can_be_harvested_nodes.push(node);
            }
        })

        this.name = City.city_names[Utils.random_int(0, City.city_names.length - 1)];
        City.city_names.splice(City.city_names.indexOf(this.name));

        this.stars_per_a_minute = 20;
        this.population = 3;
    }

    produce_unit_and_send_response(socket: Socket, unit_name: string, game: Game): void{
        const cost: number | undefined = Utils.get_unit_cost(unit_name);
        if(cost == null) return;

        // check if payment is valid if not terminate
        if(!this.owner.is_payment_valid(cost)) {
            ServerSocket.something_wrong_response(socket, this.owner, 'INSUFFICIENT STARS', `You need ${Math.abs(Math.floor(this.owner.total_owned_stars - cost))} more stars to buy a ${unit_name}`)
            return;
        }
        // make sure there isn't a unit on this city node
        if(game.map.all_nodes[this.y][this.x].unit != null){
            ServerSocket.something_wrong_response(socket, this.owner, "NO ROOM!", "There already is a unit in this city! Move it and then produce another one.")
            return;
        }
        this.owner.pay_stars(cost);


        let unit: Unit = this.owner.add_unit(this.x, this.y, unit_name, game.map);

        game.all_players.map((in_game_player: Player)=> {
            if (game.map.all_nodes[this.y][this.x].is_shown.includes(in_game_player.token)) {
                console.log("player+token ", in_game_player.token)
                ServerSocket.send_unit_produced_response(socket, this, unit, in_game_player);
            }
        });
    }

    get_x_in_pixels(): number{
        let row_bias = this.y % 2 === 0 ? Map.DISTANCE_BETWEEN_HEX/2 : 0;
        return (this.x * Map.DISTANCE_BETWEEN_HEX + row_bias) - Map.WORLD_WIDTH / 2;
    }

    get_y_in_pixels(): number{
        return  (this.y * 1.5 * Node.HEX_SIDE_SIZE) - Map.WORLD_HEIGHT / 2;
    }

    update_harvested_nodes(){
        for (const node of this.harvested_nodes) {
            for (const neighbour_1 of node.neighbors) {

                if(neighbour_1 == null) continue;

                if(neighbour_1.is_harvested || neighbour_1.city != null) continue;

                let harvested_neighbours = 0;
                for (const neighbour_2 of neighbour_1.neighbors) {
                    if(neighbour_2 == null) continue;

                    if(neighbour_2?.is_harvested){
                        harvested_neighbours ++;
                    }
                    if (harvested_neighbours === 2 && neighbour_2?.type !== Node.OCEAN && neighbour_2?.type !== Node.LAKE && !(this.can_be_harvested_nodes.includes(neighbour_1))) {
                        neighbour_1.harvest_cost = this.get_harvest_cost();
                        this.can_be_harvested_nodes.push(neighbour_1);
                    }
                }
            }
        }
    }

    get_harvest_cost(){
        return Math.round(City.BASE_HARVEST_COST * (this.number_of_harvested_nodes + 1))

    }

    add_harvested_node(node: Node){
        this.harvested_nodes.push(node);
        this.can_be_harvested_nodes.splice(this.can_be_harvested_nodes.indexOf(node), 1);
        this.number_of_harvested_nodes ++;
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
import {Socket} from "socket.io";
import {ServerSocket} from "../ServerSocket";
import {Utils} from "../Utils";


import CityInterface from "../../Interfaces/City/CityInterface";
import NodeInterface from "../../Interfaces/Map/NodeInterface";
import UnitInterface from "../../Interfaces/Units/UnitInterface";
import PlayerInterface from "../../Interfaces/PlayerInterface";
import GameInterface from "../../Interfaces/GameInterface";
import player from "../Player";


export default class City implements CityInterface {
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
        "Rohull", "Cudwood", "Vruhgow", "Trerough", "Muuburgh", "Nia", "Vlale", "Clery", "Ensmouth", "Agosmore",
        "Hardside","Eastburg","Rosehampton","Middleport","West Fauxkarta","Pailtown","Freeley","Buoystead Island",
        "Northport","Bellness","Manborough Beach","New Winkarta","Saybrough","Elburg","Clamkarta","Sweethampton",
        "New Melworth","Daypool","Saltby","Dodgeburg","Highcaster Falls","Sugarworth","Great Beachview","Springcester",
        "Hosborough","Middlemouth Falls","East Parkness","Seabury","Baycaster City","Eggville","Southingmouth","Winterland",
        "Waltworth","South Saystead","Kingport","Weirbrough","Jamesbrough","Clamburg","Lunaside","Hapland","Fishgrad","Hapfolk",
        "North Backdale","Northworth","Prodale","Westley","Middleworth","North Factford","Tallbury Hills","Sugarburg","Bayham",
        "Farmingborough","Angerport","Cloudstead","New Fairfield","Hogview","Sweettown","Lunport","Luntown","Farmland","Sweetfield"
        ,"Angerdol","Halldale","Sugardale","New Saltcaster","Melwich","Gilby","Hallham","Daydale City","Sugarwich","East Valenkarta","Buoyworth"
    ];



    public static readonly BASE_HARVEST_COST = 5;

    owner: PlayerInterface;
    readonly x: number;
    readonly y: number;
    readonly cords_in_pixels_x: number;
    readonly cords_in_pixels_y: number;
    readonly name: string;

    can_be_harvested_nodes: NodeInterface[];
    harvested_nodes: NodeInterface[];
    population: number;
    number_of_harvested_nodes: number;


    constructor(owner: PlayerInterface, city_node: NodeInterface){
        this.owner = owner;

        this.x = city_node.x;
        this.y = city_node.y;
        this.cords_in_pixels_x = this.getXInPixels();
        this.cords_in_pixels_y = this.getYInPixels();

        this.number_of_harvested_nodes = 0;

        this.harvested_nodes = [city_node];
        this.can_be_harvested_nodes = [];

        city_node.neighbors.map((node: NodeInterface| undefined)=>{
            if(node != null && !node.is_harvested && node.city == null){
            this.can_be_harvested_nodes.push(node);
            }
        })

        this.name = City.city_names[Utils.randomInt(0, City.city_names.length - 1)];

        this.population = 3;
    }

    produceUnitAndSendResponse(socket: Socket, unit_name: string, game: GameInterface): void {
        const cost: number | undefined = Utils.getUnitCost(unit_name);
        if (cost == null) return;

        // check if payment is valid if not terminate
        if (!this.owner.isPaymentValid(cost)) {
            ServerSocket.somethingWrongResponse(socket, this.owner.token, 'INSUFFICIENT STARS', `You need ${Math.abs(Math.floor(this.owner.total_owned_stars - cost))} more stars to buy a ${unit_name}`)
            return;
        }
        // make sure there isn't a unit on this city node
        if (game.map.all_nodes[this.y][this.x].unit != null) {
            ServerSocket.somethingWrongResponse(socket, this.owner.token, "NO ROOM!", "There already is a unit in this city! Move it and then produce another one.")
            return;
        }
        this.owner.payStars(cost);

        let unit: UnitInterface = this.owner.addUnit(this.x, this.y, unit_name, game.map);

        game.all_players.map((in_game_player: PlayerInterface) => {
            if (game.map.all_nodes[this.y][this.x].is_shown.includes(in_game_player.token)) {

                // player is not AI
                if(! in_game_player.is_ai) {
                    ServerSocket.sendUnitProducedResponse(socket, <City>this, unit, in_game_player, game.token);
                }
            }
        });
    }

    getXInPixels(): number {
        let row_bias = this.y % 2 === 0 ? Utils.DISTANCE_BETWEEN_HEX / 2 : 0;
        return (this.x * Utils.DISTANCE_BETWEEN_HEX + row_bias) - Utils.WORLD_WIDTH / 2;
    }

    getYInPixels(): number {
        return (this.y * 1.5 * Utils.HEX_SIDE_SIZE) - Utils.WORLD_HEIGHT / 2;
    }

    updateHarvestedNodes() {
        for (const node of this.harvested_nodes) {
            for (const neighbour_1 of node.neighbors) {

                if (neighbour_1 == null) continue;

                if (neighbour_1.is_harvested || neighbour_1.city != null) continue;

                let harvested_neighbours = 0;
                for (const neighbour_2 of neighbour_1.neighbors) {
                    if (neighbour_2 == null) continue;

                    if (neighbour_2?.is_harvested) {
                        harvested_neighbours++;
                    }
                    if (harvested_neighbours === 2 && neighbour_2?.type !== Utils.OCEAN && neighbour_2?.type !== Utils.LAKE && !(this.can_be_harvested_nodes.includes(neighbour_1))) {
                        neighbour_1.harvest_cost = this.getHarvestCost();
                        this.can_be_harvested_nodes.push(neighbour_1);
                    }
                }
            }
        }
    }

    getHarvestCost() {
        return Math.round(City.BASE_HARVEST_COST + 4 * (this.number_of_harvested_nodes))

    }

    addHarvestedNode(node: NodeInterface) {
        this.harvested_nodes.push(node);
        this.can_be_harvested_nodes.splice(this.can_be_harvested_nodes.indexOf(node), 1);
        this.number_of_harvested_nodes++;
    }

    getData(player_token: string): any {
        return {
            x: this.x,
            y: this.y,
            cords_in_pixels_x: this.cords_in_pixels_x,
            cords_in_pixels_y: this.cords_in_pixels_y,
            name: this.name,
            number_of_harvested_nodes: this.number_of_harvested_nodes,
            population: this.population,
            is_friendly: this.owner.token === player_token
        }
    }

}

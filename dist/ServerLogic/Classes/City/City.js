"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ServerSocket_1 = require("../ServerSocket");
const Utils_1 = require("../Utils");
class City {
    constructor(owner, city_node) {
        this.owner = owner;
        this.x = city_node.x;
        this.y = city_node.y;
        this.cords_in_pixels_x = this.getXInPixels();
        this.cords_in_pixels_y = this.getYInPixels();
        this.number_of_harvested_nodes = 0;
        this.harvested_nodes = [city_node];
        this.can_be_harvested_nodes = [];
        city_node.neighbors.map((node) => {
            if (node != null && !node.is_harvested && node.city == null) {
                this.can_be_harvested_nodes.push(node);
            }
        });
        this.name = City.city_names[Utils_1.Utils.randomInt(0, City.city_names.length - 1)];
        City.city_names.splice(City.city_names.indexOf(this.name));
        this.stars_per_a_minute = 20;
        this.population = 3;
    }
    produceUnitAndSendResponse(socket, unit_name, game) {
        const cost = Utils_1.Utils.getUnitCost(unit_name);
        if (cost == null)
            return;
        // check if payment is valid if not terminate
        if (!this.owner.isPaymentValid(cost)) {
            ServerSocket_1.ServerSocket.somethingWrongResponse(socket, this.owner.token, 'INSUFFICIENT STARS', `You need ${Math.abs(Math.floor(this.owner.total_owned_stars - cost))} more stars to buy a ${unit_name}`);
            return;
        }
        // make sure there isn't a unit on this city node
        if (game.map.all_nodes[this.y][this.x].unit != null) {
            ServerSocket_1.ServerSocket.somethingWrongResponse(socket, this.owner.token, "NO ROOM!", "There already is a unit in this city! Move it and then produce another one.");
            return;
        }
        this.owner.payStars(cost);
        let unit = this.owner.addUnit(this.x, this.y, unit_name, game.map);
        game.all_players.map((in_game_player) => {
            if (game.map.all_nodes[this.y][this.x].is_shown.includes(in_game_player.token)) {
                console.log("player+token ", in_game_player.token);
                ServerSocket_1.ServerSocket.sendUnitProducedResponse(socket, this, unit, in_game_player, game.token);
            }
        });
    }
    getXInPixels() {
        let row_bias = this.y % 2 === 0 ? Utils_1.Utils.DISTANCE_BETWEEN_HEX / 2 : 0;
        return (this.x * Utils_1.Utils.DISTANCE_BETWEEN_HEX + row_bias) - Utils_1.Utils.WORLD_WIDTH / 2;
    }
    getYInPixels() {
        return (this.y * 1.5 * Utils_1.Utils.HEX_SIDE_SIZE) - Utils_1.Utils.WORLD_HEIGHT / 2;
    }
    updateHarvestedNodes() {
        for (const node of this.harvested_nodes) {
            for (const neighbour_1 of node.neighbors) {
                if (neighbour_1 == null)
                    continue;
                if (neighbour_1.is_harvested || neighbour_1.city != null)
                    continue;
                let harvested_neighbours = 0;
                for (const neighbour_2 of neighbour_1.neighbors) {
                    if (neighbour_2 == null)
                        continue;
                    if (neighbour_2 === null || neighbour_2 === void 0 ? void 0 : neighbour_2.is_harvested) {
                        harvested_neighbours++;
                    }
                    if (harvested_neighbours === 2 && (neighbour_2 === null || neighbour_2 === void 0 ? void 0 : neighbour_2.type) !== Utils_1.Utils.OCEAN && (neighbour_2 === null || neighbour_2 === void 0 ? void 0 : neighbour_2.type) !== Utils_1.Utils.LAKE && !(this.can_be_harvested_nodes.includes(neighbour_1))) {
                        neighbour_1.harvest_cost = this.getHarvestCost();
                        this.can_be_harvested_nodes.push(neighbour_1);
                    }
                }
            }
        }
    }
    getHarvestCost() {
        return Math.round(City.BASE_HARVEST_COST + 4 * (this.number_of_harvested_nodes));
    }
    addHarvestedNode(node) {
        this.harvested_nodes.push(node);
        this.can_be_harvested_nodes.splice(this.can_be_harvested_nodes.indexOf(node), 1);
        this.number_of_harvested_nodes++;
    }
    getData(player_token) {
        return {
            x: this.x,
            y: this.y,
            cords_in_pixels_x: this.cords_in_pixels_x,
            cords_in_pixels_y: this.cords_in_pixels_y,
            name: this.name,
            stars_per_a_minute: this.stars_per_a_minute,
            population: this.population,
            is_friendly: this.owner.token === player_token
        };
    }
}
exports.default = City;
City.city_names = [
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
City.BASE_HARVEST_COST = 5;

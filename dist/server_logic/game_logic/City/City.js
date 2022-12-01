"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ServerSocket_1 = require("../../ServerSocket");
var Map_1 = __importDefault(require("../Map/Map"));
var Node_1 = require("../Map/Node");
var Utils_1 = require("../../../Utils");
var City = /** @class */ (function () {
    function City(owner, city_node) {
        var _this = this;
        this.owner = owner;
        this.x = city_node.x;
        this.y = city_node.y;
        this.cords_in_pixels_x = this.get_x_in_pixels();
        this.cords_in_pixels_y = this.get_y_in_pixels();
        this.number_of_harvested_nodes = 0;
        this.harvested_nodes = [city_node];
        this.can_be_harvested_nodes = [];
        city_node.neighbors.map(function (node) {
            if (node != null && !node.is_harvested && node.city == null) {
                _this.can_be_harvested_nodes.push(node);
            }
        });
        console.log(this.can_be_harvested_nodes);
        this.name = City.city_names[Utils_1.Utils.random_int(0, City.city_names.length - 1)];
        City.city_names.splice(City.city_names.indexOf(this.name));
        this.stars_per_a_minute = 20;
        this.population = 3;
    }
    City.prototype.produce_unit_and_send_response = function (socket, unit_name, map) {
        var cost = Utils_1.Utils.get_unit_cost(unit_name);
        if (cost == null)
            return;
        // check if payment is valid if not terminate
        if (!this.owner.is_payment_valid(cost)) {
            ServerSocket_1.ServerSocket.something_wrong_response(socket, this.owner, 'INSUFFICIENT STARS', "You need ".concat(Math.abs(Math.floor(this.owner.total_owned_stars - cost)), " more stars to buy a ").concat(unit_name));
            return;
        }
        // make sure there isn't a unit on this city node
        if (map.all_nodes[this.y][this.x].unit != null) {
            ServerSocket_1.ServerSocket.something_wrong_response(socket, this.owner, "NO ROOM!", "There already is a unit in this city! Move it and then produce another one.");
            return;
        }
        this.owner.pay_stars(cost);
        var unit = this.owner.add_unit(this.x, this.y, unit_name, map);
        ServerSocket_1.ServerSocket.send_unit_produced_response(socket, this, unit);
    };
    City.prototype.get_x_in_pixels = function () {
        var row_bias = this.y % 2 === 0 ? Map_1.default.DISTANCE_BETWEEN_HEX / 2 : 0;
        return (this.x * Map_1.default.DISTANCE_BETWEEN_HEX + row_bias) - Map_1.default.WORLD_WIDTH / 2;
    };
    City.prototype.get_y_in_pixels = function () {
        return (this.y * 1.5 * Node_1.Node.HEX_SIDE_SIZE) - Map_1.default.WORLD_HEIGHT / 2;
    };
    City.prototype.update_harvested_nodes = function () {
        for (var _i = 0, _a = this.harvested_nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            for (var _b = 0, _c = node.neighbors; _b < _c.length; _b++) {
                var neighbour_1 = _c[_b];
                if (neighbour_1 == null)
                    continue;
                if (neighbour_1.is_harvested || neighbour_1.city != null)
                    continue;
                var harvested_neighbours = 0;
                for (var _d = 0, _e = neighbour_1.neighbors; _d < _e.length; _d++) {
                    var neighbour_2 = _e[_d];
                    if (neighbour_2 == null)
                        continue;
                    if (neighbour_2 === null || neighbour_2 === void 0 ? void 0 : neighbour_2.is_harvested) {
                        harvested_neighbours++;
                    }
                    if (harvested_neighbours === 2 && (neighbour_2 === null || neighbour_2 === void 0 ? void 0 : neighbour_2.type) !== Node_1.Node.OCEAN && (neighbour_2 === null || neighbour_2 === void 0 ? void 0 : neighbour_2.type) !== Node_1.Node.LAKE && !(this.can_be_harvested_nodes.includes(neighbour_1))) {
                        neighbour_1.harvest_cost = this.get_harvest_cost();
                        this.can_be_harvested_nodes.push(neighbour_1);
                    }
                }
            }
        }
    };
    City.prototype.get_harvest_cost = function () {
        return Math.round(City.BASE_HARVEST_COST * (this.number_of_harvested_nodes + 1));
    };
    City.prototype.add_harvested_node = function (node) {
        this.harvested_nodes.push(node);
        this.can_be_harvested_nodes.splice(this.can_be_harvested_nodes.indexOf(node), 1);
        this.number_of_harvested_nodes++;
    };
    City.prototype.get_data = function (player_token) {
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
    };
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
    return City;
}());
exports.default = City;

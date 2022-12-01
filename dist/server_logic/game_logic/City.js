"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ServerSocket_1 = require("../ServerSocket");
var Map_1 = __importDefault(require("./Map/Map"));
var Node_1 = require("./Map/Node");
var Utils_1 = require("../../Utils");
var City = /** @class */ (function () {
    function City(owner, x, y) {
        this.owner = owner;
        this.x = x;
        this.y = y;
        this.cords_in_pixels_x = this.get_x_in_pixels();
        this.cords_in_pixels_y = this.get_y_in_pixels();
        this.name = City.city_names[Utils_1.Utils.random_int(0, City.city_names.length - 1)];
        City.city_names.splice(City.city_names.indexOf(this.name));
        this.stars_per_a_minute = 20;
        this.population = 3;
    }
    City.prototype.produce_unit_and_send_response = function (socket, unit_name) {
        var cost = Utils_1.Utils.get_unit_cost(unit_name);
        if (cost == null)
            return;
        // check if payment is valid if not terminate
        if (!this.owner.is_payment_valid(cost)) {
            ServerSocket_1.ServerSocket.insufficient_funds_response(socket, this.owner, 'INSUFFICIENT STARS', "You need ".concat(Math.abs(Math.floor(this.owner.total_owned_stars - cost)), " more stars to buy a ").concat(unit_name));
            return;
        }
        this.owner.pay_stars(cost);
        var unit = this.owner.add_unit(this.x, this.y, unit_name);
        ServerSocket_1.ServerSocket.send_unit_produced_response(socket, this, unit);
    };
    City.prototype.get_x_in_pixels = function () {
        var row_bias = this.y % 2 === 0 ? Map_1.default.DISTANCE_BETWEEN_HEX / 2 : 0;
        return (this.x * Map_1.default.DISTANCE_BETWEEN_HEX + row_bias) - Map_1.default.WORLD_WIDTH / 2;
    };
    City.prototype.get_y_in_pixels = function () {
        return (this.y * 1.5 * Node_1.Node.HEX_SIDE_SIZE) - Map_1.default.WORLD_HEIGHT / 2;
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
    return City;
}());
exports.default = City;

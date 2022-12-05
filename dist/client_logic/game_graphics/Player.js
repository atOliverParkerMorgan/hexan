import Unit from "./Unit/Unit.js";
import { update_progress_bar, update_star_info } from "../UI_logic.js";
import { Interval } from "./Interval.js";
import { Node } from "./Node.js";
import { HEX_SIDE_SIZE } from "./Pixi.js";
//singleton client-player
export var Player;
(function (Player) {
    // units
    Player.all_units = [];
    Player.all_enemy_visible_units = [];
    Player.all_cities = [];
    // player star production
    var total_owned_stars = 0;
    var star_production = 0;
    Player.production_units = [];
    Player.owned_technologies = [];
    // player star logic
    function produce_stars() {
        Interval.make_star_production_interval(function () {
            total_owned_stars += star_production / 120;
            update_star_info(Math.floor(total_owned_stars));
        }, 500); // update every half second
        // update star production bar
        Interval.make_update_progress_bar_interval(function () {
            update_progress_bar(total_owned_stars);
        }, 50);
    }
    Player.produce_stars = produce_stars;
    function update_units_after_attack(unit_data) {
        Player.all_units.map(function (unit) {
            if (unit.id === unit_data.id) {
                unit.health = unit_data.health;
                unit.update_unit_on_stage();
            }
        });
        Player.all_enemy_visible_units.map(function (enemy_unit) {
            if (enemy_unit.id === unit_data.id) {
                enemy_unit.health = unit_data.health;
                enemy_unit.update_unit_on_stage();
            }
        });
    }
    Player.update_units_after_attack = update_units_after_attack;
    function setup_star_production(data) {
        total_owned_stars = data.total_owned_stars;
        star_production = data.star_production;
        update_star_info(total_owned_stars, star_production);
        // check if the intervals haven't been already added
        produce_stars();
    }
    Player.setup_star_production = setup_star_production;
    function set_total_owned_stars(new_total_owned_stars) {
        total_owned_stars = new_total_owned_stars;
    }
    Player.set_total_owned_stars = set_total_owned_stars;
    function reset_units() {
        Player.all_units = [];
    }
    Player.reset_units = reset_units;
    function has_friendly_unit(unit_id) {
        for (var _i = 0, _a = Player.all_units; _i < _a.length; _i++) {
            var unit = _a[_i];
            if (unit_id === unit.id)
                return true;
        }
        return false;
    }
    Player.has_friendly_unit = has_friendly_unit;
    function owns_city(city_name) {
        for (var _i = 0, all_cities_1 = Player.all_cities; _i < all_cities_1.length; _i++) {
            var city = all_cities_1[_i];
            if (city.name === city_name) {
                return true;
            }
        }
        return false;
    }
    Player.owns_city = owns_city;
    function remove_city(city_name) {
        for (var index = 0; index < Player.all_cities.length; index++) {
            if (Player.all_cities[index].name === city_name) {
                Player.all_cities.splice(index);
                break;
            }
        }
    }
    Player.remove_city = remove_city;
    function has_enemy_unit(unit_id) {
        for (var _i = 0, _a = Player.all_enemy_visible_units; _i < _a.length; _i++) {
            var enemy_unit = _a[_i];
            if (unit_id === enemy_unit.id)
                return true;
        }
        return false;
    }
    Player.has_enemy_unit = has_enemy_unit;
    function delete_enemy_visible_unit(unit) {
        if (!Player.has_enemy_unit(unit.id))
            return;
        var index = 0;
        for (; index < Player.all_enemy_visible_units.length; index++) {
            if (Player.all_enemy_visible_units[index].id === unit.id)
                break;
        }
        var enemy_unit = Player.all_enemy_visible_units[index];
        if (enemy_unit == null)
            return;
        enemy_unit.remove_children();
        Node.all_nodes[enemy_unit.y][enemy_unit.x].unit = null;
        Player.all_enemy_visible_units.splice(index);
    }
    Player.delete_enemy_visible_unit = delete_enemy_visible_unit;
    function delete_friendly_unit(unit) {
        if (!Player.has_friendly_unit(unit.id))
            return;
        var index = 0;
        for (; index < Player.all_units.length; index++) {
            if (Player.all_units[index].id === unit.id)
                break;
        }
        var friendly_unit = Player.all_units[index];
        if (friendly_unit == null)
            return;
        friendly_unit.remove_children();
        Node.all_nodes[friendly_unit.y][friendly_unit.x].unit = null;
        Player.all_units.splice(index);
    }
    Player.delete_friendly_unit = delete_friendly_unit;
    function add_enemy_unit(unit) {
        var graphics_enemy_unit = new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE * .75, false);
        Player.all_enemy_visible_units.push(graphics_enemy_unit);
        Node.all_nodes[unit.y][unit.x].unit = graphics_enemy_unit;
    }
    Player.add_enemy_unit = add_enemy_unit;
    function add_unit(unit) {
        var graphics_unit = new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE * .75, true);
        Player.all_units.push(graphics_unit);
        Node.all_nodes[unit.y][unit.x].unit = graphics_unit;
    }
    Player.add_unit = add_unit;
    function update_total_number_of_stars(response_data) {
        var total_owned_stars = response_data.total_owned_stars;
        if (total_owned_stars != null) {
            set_total_owned_stars(total_owned_stars);
        }
    }
    Player.update_total_number_of_stars = update_total_number_of_stars;
    function get_total_number_of_stars() {
        return total_owned_stars;
    }
    Player.get_total_number_of_stars = get_total_number_of_stars;
})(Player || (Player = {}));

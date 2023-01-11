import Unit from "./Unit/Unit.js";
import { updateProgressBar, updateStarInfo } from "../UiLogic.js";
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
    var total_owned_stars = 10;
    var star_production = 10;
    Player.production_units = [];
    Player.owned_technologies = [];
    function containsCity(city_name) {
        for (var _i = 0, all_cities_1 = Player.all_cities; _i < all_cities_1.length; _i++) {
            var city = all_cities_1[_i];
            if (city.name === city_name)
                return true;
        }
        return false;
    }
    Player.containsCity = containsCity;
    // player star logic
    function produceStars() {
        Interval.makeStarProductionInterval(function () {
            total_owned_stars += star_production / 120;
            updateStarInfo(Math.floor(total_owned_stars));
        }, 500); // update every half second
        // update star production bar
        Interval.makeUpdateProgressBarInterval(function () {
            updateProgressBar(total_owned_stars);
        }, 50);
    }
    Player.produceStars = produceStars;
    function updateUnitsAfterAttack(unit_data) {
        Player.all_units.map(function (unit) {
            if (unit.id === unit_data.id) {
                unit.health = unit_data.health;
                unit.updateUnitOnStage();
            }
        });
        Player.all_enemy_visible_units.map(function (enemy_unit) {
            if (enemy_unit.id === unit_data.id) {
                enemy_unit.health = unit_data.health;
                enemy_unit.updateUnitOnStage();
            }
        });
    }
    Player.updateUnitsAfterAttack = updateUnitsAfterAttack;
    function setupStarProduction(data) {
        total_owned_stars = data.total_owned_stars;
        star_production = data.star_production;
        updateStarInfo(total_owned_stars, star_production);
        // check if the intervals haven't been already added
        produceStars();
    }
    Player.setupStarProduction = setupStarProduction;
    function setTotalOwnedStars(new_total_owned_stars) {
        total_owned_stars = new_total_owned_stars;
    }
    Player.setTotalOwnedStars = setTotalOwnedStars;
    function resetUnits() {
        Player.all_units = [];
    }
    Player.resetUnits = resetUnits;
    function hasFriendlyUnit(unit_id) {
        for (var _i = 0, _a = Player.all_units; _i < _a.length; _i++) {
            var unit = _a[_i];
            if (unit_id === unit.id)
                return true;
        }
        return false;
    }
    Player.hasFriendlyUnit = hasFriendlyUnit;
    function hasEnemyUnit(unit_id) {
        for (var _i = 0, _a = Player.all_enemy_visible_units; _i < _a.length; _i++) {
            var enemy_unit = _a[_i];
            if (unit_id === enemy_unit.id)
                return true;
        }
        return false;
    }
    Player.hasEnemyUnit = hasEnemyUnit;
    function getUnit(id) {
        var index = 0;
        for (; index < Player.all_units.length; index++) {
            if (Player.all_units[index].id === id)
                break;
        }
        if (index === Player.all_units.length)
            return null;
        return Player.all_units[index];
    }
    Player.getUnit = getUnit;
    function getEnemyVisibleUnit(id) {
        var index = 0;
        for (; index < Player.all_enemy_visible_units.length; index++) {
            if (Player.all_enemy_visible_units[index].id === id)
                break;
        }
        if (index === Player.all_enemy_visible_units.length)
            return null;
        return Player.all_enemy_visible_units[index];
    }
    Player.getEnemyVisibleUnit = getEnemyVisibleUnit;
    function deleteEnemyVisibleUnit(unit) {
        if (!Player.hasEnemyUnit(unit.id))
            return;
        var enemy_unit = Player.getEnemyVisibleUnit(unit.id);
        if (enemy_unit == null)
            return;
        Node.all_nodes[enemy_unit.y][enemy_unit.x].removeUnit();
        Player.all_enemy_visible_units.splice(Player.all_enemy_visible_units.indexOf(enemy_unit), 1);
    }
    Player.deleteEnemyVisibleUnit = deleteEnemyVisibleUnit;
    function deleteFriendlyUnit(unit) {
        if (!Player.hasFriendlyUnit(unit.id))
            return;
        var friendly_unit = getUnit(unit.id);
        if (friendly_unit == null)
            return;
        Node.all_nodes[friendly_unit.y][friendly_unit.x].removeUnit();
        Player.all_units.splice(Player.all_units.indexOf(friendly_unit), 1);
    }
    Player.deleteFriendlyUnit = deleteFriendlyUnit;
    function addEnemyUnit(unit) {
        var graphics_enemy_unit = new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE * .75, false);
        Player.all_enemy_visible_units.push(graphics_enemy_unit);
        Node.all_nodes[unit.y][unit.x].unit = graphics_enemy_unit;
    }
    Player.addEnemyUnit = addEnemyUnit;
    function addUnit(unit) {
        var graphics_unit = new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE * .75, true);
        Player.all_units.push(graphics_unit);
        Node.all_nodes[unit.y][unit.x].unit = graphics_unit;
    }
    Player.addUnit = addUnit;
    function updateTotalNumberOfStars(response_data) {
        var total_owned_stars = response_data.total_owned_stars;
        if (total_owned_stars != null) {
            setTotalOwnedStars(total_owned_stars);
        }
    }
    Player.updateTotalNumberOfStars = updateTotalNumberOfStars;
    function getTotalNumberOfStars() {
        return total_owned_stars;
    }
    Player.getTotalNumberOfStars = getTotalNumberOfStars;
})(Player || (Player = {}));

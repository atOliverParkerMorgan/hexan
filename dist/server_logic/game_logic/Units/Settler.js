"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Unit_1 = require("./Unit");
var Settler = /** @class */ (function (_super) {
    __extends(Settler, _super);
    function Settler(x, y, id, map) {
        return _super.call(this, x, y, id, map, Settler.SETTLER_UNIT) || this;
    }
    Settler.prototype.settle = function (owner, game) {
        var city_node = game.map.get_node(_super.prototype.get_x.call(this), _super.prototype.get_y.call(this));
        if (city_node == null)
            return;
        game.add_city(owner, city_node);
    };
    Settler.prototype.can_settle = function () {
        return true;
    };
    Settler.SETTLER_UNIT = {
        name: "Settler",
        attack: 0,
        health: 100,
        range: 0,
        movement: 100,
        cost: 20,
        action: Unit_1.Unit.SETTLE,
        type: Unit_1.Unit.SETTLER
    };
    return Settler;
}(Unit_1.Unit));
exports.default = Settler;

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
var Melee = /** @class */ (function (_super) {
    __extends(Melee, _super);
    function Melee(x, y, id, map, unit_init_data) {
        return _super.call(this, x, y, id, map, unit_init_data) || this;
    }
    Melee.WARRIOR = {
        name: "Warrior",
        attack: 25,
        health: 100,
        range: 1,
        movement: 100,
        cost: 4,
        action: Unit_1.Unit.FORTIFY,
        type: Unit_1.Unit.MELEE
    };
    Melee.SPEARMAN = {
        name: "Spearman",
        attack: 40,
        health: 100,
        range: 1,
        movement: 100,
        cost: 4,
        action: Unit_1.Unit.FORTIFY,
        type: Unit_1.Unit.MELEE
    };
    return Melee;
}(Unit_1.Unit));
exports.default = Melee;

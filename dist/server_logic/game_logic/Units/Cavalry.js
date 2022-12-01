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
var Cavalry = /** @class */ (function (_super) {
    __extends(Cavalry, _super);
    function Cavalry(x, y, id, map, unit_init_data) {
        return _super.call(this, x, y, id, map, unit_init_data) || this;
    }
    Cavalry.HORSEMAN = {
        name: "Horseman",
        attack: 20,
        health: 100,
        range: 1,
        movement: 25,
        cost: 8,
        action: Unit_1.Unit.FORTIFY,
        type: Unit_1.Unit.CAVALRY
    };
    return Cavalry;
}(Unit_1.Unit));
exports.default = Cavalry;

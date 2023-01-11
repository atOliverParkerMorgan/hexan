import Map from "../Classes/Map/Map";
import Player from "../Classes/Player";
import UnitInterface from "./Units/UnitInterface";
import Technology from "../Classes/Technology/Technology";
import MapInterface from "./Map/MapInterface";

export default interface PlayerInterface {
    token: string;
    map_size: number;
    units: UnitInterface[];
    production_units: any[];
    root_tech_tree_node: Technology;
    total_owned_stars: number;
    star_production: number;
    owned_technology: String[];
    star_production_has_started: boolean;

    addUnit(x: number, y: number, name: string, map: Map): UnitInterface;

    getUnit(id: string): UnitInterface | undefined;

    ownsThisUnit(id: string): boolean;

    removeUnit(id: string, map: MapInterface): boolean;

    getUnitType(id: string): string | undefined;

    getUnitData(): UnitInterface[];

    attackUnit(unit_friendly: UnitInterface, unit_enemy: UnitInterface, enemy_player: Player, map: MapInterface): boolean[];

    produceStars(): void;

    isPaymentValid(payment: number): boolean;

    payStars(payment: number): void;

    increaseProduction(star_increment: number): void;

    getData(): { production_unit_types: any };
}

import Map from "../Classes/Map/Map"

import CityInterface from "./City/CityInterface";
import UnitInterface from "./Units/UnitInterface";
import TechnologyInterface from "./Technology/TechnologyInterface";
import PlayerInterface from "./PlayerInterface";
import NodeInterface from "./Map/NodeInterface";


export default interface GameInterface {
    token: string;
    all_players: PlayerInterface[];
    all_cities: CityInterface[];
    map: Map;
    game_mode: string;

    startStarProduction(): void;

    playerIsAlive(player: PlayerInterface): boolean;
    killPlayer(player: PlayerInterface): void;

    placeStartCity(player: PlayerInterface): void;

    getPlayer(token: string): PlayerInterface | undefined;

    getEnemyPlayers(token: string): PlayerInterface[];

    getEnemyPlayerByUnit(unit_id: string): PlayerInterface | undefined;

    getCitiesThatPlayerOwns(player: PlayerInterface): CityInterface[];

    getCity(city_name: string, city_owner: PlayerInterface): CityInterface | undefined;

    settle(player: PlayerInterface, city_node: NodeInterface | undefined, unit_id: string, map: Map): boolean;

    addCity(player: PlayerInterface, city_node: NodeInterface | undefined): void;

    getVisibleUnits(player: PlayerInterface): UnitInterface[];

    purchaseTechnology(player_token: string, tech_name: string): boolean;

    getClosestCityDistance(node: NodeInterface): number;

    getPlayerCities(player_token: string): CityInterface[];

    getData(player: PlayerInterface): { production_units: any[]; cities: any; root_tech_tree_node: TechnologyInterface; units: any; map: any };
}
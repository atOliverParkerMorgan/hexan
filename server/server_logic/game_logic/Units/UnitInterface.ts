// format of unit_data received from ClientSocket

export interface UnitInterface {
    x: number;
    y: number;

    id: string;

    type: string;
    action: string;

    is_on_water: boolean;

    attack: number;
    health: number;
    range: number;
    movement: number;
    name: string;
    cost: number;
}
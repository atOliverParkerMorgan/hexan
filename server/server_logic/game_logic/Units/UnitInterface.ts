// format of unit_data received from ClientSocket

export interface UnitInterface {
    x: number;
    y: number;

    id: string;

    type: string;
    action: string;

    attack: number;
    health: number;
    range: number;
    movement: number;
    name: string;
    cost: number;
}
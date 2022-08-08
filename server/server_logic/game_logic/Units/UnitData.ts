// format of unit_data received from ClientSocket

export interface UnitData{
    x: number;
    y: number;

    id: string;

    type: string;

    attack: number;
    health: number;
    range: number;
    movement: number;
}
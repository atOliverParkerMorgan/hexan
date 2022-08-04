// format of unit_data received from ClientSocket
interface UnitData{
    x: number;
    y: number;

    id: string;

    type: string;

    attack: number;
    health: number;
    range: number;
    movement: number;
}
// an interface for initializing specific unit like Warrior, Slinger, Settler ...

export interface UnitInitData{
    attack: number;
    health: number;
    range: number;
    movement: number;

    action: string;
    type: string;
    cost: number;

    name: string
}
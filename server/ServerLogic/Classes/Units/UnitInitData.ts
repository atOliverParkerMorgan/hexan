// an interface for initializing specific unit like Warrior, Slinger, Settler ...

export default interface UnitInitData{
    attack: number;
    health: number;
    range: number;
    movement: number;
    action: string;
    type: string;
    cost: number;

    name: string
}
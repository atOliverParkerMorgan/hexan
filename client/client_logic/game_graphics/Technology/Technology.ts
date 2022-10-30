export class Technology{
    children: Technology[] | null;
    name: string;
    image: string;
    description: string;
    cost: number;
    is_owned: boolean

    constructor(children: Technology[] | null, name: string, image: string, description: string, cost: number, is_owned: boolean) {
        this.children = children;
        this.name = name;
        this.image = image;
        this.description = description;
        this.cost = cost;
        this.is_owned = is_owned;
    }
}
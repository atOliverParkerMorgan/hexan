import Player from "../Player";

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

    // creates a link list of all technologies
    static init_tech_tree(): Technology{
        const mining = new Technology(null, "Mining", "", "", 10, false)

        const ship_building = new Technology(null, "Ship Building", "", "", 10, false)
        const construction = new Technology([ship_building], "Construction", "", "", 10, false)

        const archery = new Technology([construction], "Archery", "", "Allows to", 10, false)
        const spearman = new Technology([mining], "Spearman", "", "", 10, false)
        const horseman = new Technology(null, "Horseman", "", "", 10, false)

        return new Technology([archery, spearman, horseman], "", "", "", 0, true);
    }
}

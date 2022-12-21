import Technology from "../../Classes/Technology/Technology";

export default interface TechnologyInterface {
    children: Technology[] | null;
    name: string;
    image: string;
    description: string;
    cost: number;
    is_owned: boolean;
}
import {tech_tree_root} from "../Pixi.js";

// used to draw graph
export let graph: any

// used to interact with the tech tree
export let interaction_nodes_values: any;
export let nodes: any;

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


    static ownsTechnology(root: Technology, technology_name: string): boolean{
        let all_children = [root]
        let current_node;

        do{
            current_node = all_children.shift();

            if(current_node == null) return false;
            if(current_node?.children == null) continue;

            for (const child of current_node?.children) {
                all_children.push(child)
            }
        }
        while (current_node.name !== technology_name)

        return current_node.is_owned;

    }

    static initGraphArrays(){

        // @ts-ignore
        graph = new Springy.Graph();
        interaction_nodes_values = [[tech_tree_root.name, 0, 0, 0, 0 , false, tech_tree_root.is_owned]];

        // @ts-ignore
        nodes = [[tech_tree_root, graph.newNode({
            name: tech_tree_root.name,
            image: tech_tree_root.image,
            description: tech_tree_root.description,
            cost: tech_tree_root.cost,
            is_owned: tech_tree_root.is_owned
        })]]

        while (nodes.length !== 0){
            let node_data: any = nodes.shift()
            node_data[0].children?.forEach((child: Technology)=>{
                if(child != null){
                    let graph_node_child = graph.newNode({
                        name: child.name,
                        image: child.image,
                        description: child.description,
                        cost: child.cost,
                        is_owned: child.is_owned
                    })

                    graph.newEdge(node_data[1], graph_node_child);
                    nodes.push([child, graph_node_child]);
                    interaction_nodes_values.push([child.name, 0, 0, 0, 0 , false, child.is_owned])
                }
            })

        }
    }
}
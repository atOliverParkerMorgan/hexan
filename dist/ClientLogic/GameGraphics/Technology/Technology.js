import { tech_tree_root } from "../Pixi.js";
// used to draw graph
export var graph;
// used to interact with the tech tree
export var interaction_nodes_values;
export var nodes;
var Technology = /** @class */ (function () {
    function Technology(children, name, image, description, cost, is_owned) {
        this.children = children;
        this.name = name;
        this.image = image;
        this.description = description;
        this.cost = cost;
        this.is_owned = is_owned;
    }
    Technology.ownsTechnology = function (root, technology_name) {
        var all_children = [root];
        var current_node;
        do {
            current_node = all_children.shift();
            if (current_node == null)
                return false;
            if ((current_node === null || current_node === void 0 ? void 0 : current_node.children) == null)
                continue;
            for (var _i = 0, _a = current_node === null || current_node === void 0 ? void 0 : current_node.children; _i < _a.length; _i++) {
                var child = _a[_i];
                all_children.push(child);
            }
        } while (current_node.name !== technology_name);
        return current_node.is_owned;
    };
    Technology.initGraphArrays = function () {
        var _a;
        // @ts-ignore
        graph = new Springy.Graph();
        interaction_nodes_values = [[tech_tree_root.name, 0, 0, 0, 0, false, tech_tree_root.is_owned]];
        // @ts-ignore
        nodes = [[tech_tree_root, graph.newNode({
                    name: tech_tree_root.name,
                    image: tech_tree_root.image,
                    description: tech_tree_root.description,
                    cost: tech_tree_root.cost,
                    is_owned: tech_tree_root.is_owned
                })]];
        var _loop_1 = function () {
            var node_data = nodes.shift();
            (_a = node_data[0].children) === null || _a === void 0 ? void 0 : _a.forEach(function (child) {
                if (child != null) {
                    var graph_node_child = graph.newNode({
                        name: child.name,
                        image: child.image,
                        description: child.description,
                        cost: child.cost,
                        is_owned: child.is_owned
                    });
                    graph.newEdge(node_data[1], graph_node_child);
                    nodes.push([child, graph_node_child]);
                    interaction_nodes_values.push([child.name, 0, 0, 0, 0, false, child.is_owned]);
                }
            });
        };
        while (nodes.length !== 0) {
            _loop_1();
        }
    };
    return Technology;
}());
export { Technology };

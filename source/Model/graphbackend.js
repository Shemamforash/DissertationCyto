/**
 * Created by Sam on 20/01/2017.
 */
var e, n, r, Graph = {
    init: function () {
        e = Graph.edges;
        n = Graph.nodes;
        r = Graph.resources;
    },
    edges: {
        edge_list: [],
        add: function (edge) {
            var source = edge.source().id();
            var target = edge.target().id();
            console.log("Desired edge: " + source + " ::::: " + target);
            for (var i = 0; i < e.edge_list.length; ++i) {
                var existing_edge = e.edge_list[i];
                var edge_source = existing_edge.source().id();
                var edge_target = existing_edge.target().id()
                console.log("Existing edge: " + edge_source + " ::::: " + edge_target);
                if ((edge_source === source && edge_target === target) || (edge_target === source && edge_source === target)) {
                    console.log("exists");
                    return false;
                }
                console.log("     ");
            }
            e.edge_list.push(edge);
            return true;
        }
    },
    nodes: {
        node_number: 0,
        node_list: {},
        create_rule: function (rule_id, code, xml_blocks) {
            var graph_node = n.node_list[CyA.current_node.id()];
            var current_rule = null;
            if (graph_node) {
                if (rule_id === "") {
                    rule_id = 'Rule ' + graph_node.rules.length;

                }
                current_rule = {
                    id: rule_id,
                    code: code,
                    blocks: xml_blocks
                };
                graph_node.rules.push(current_rule);
            }
            return current_rule;
        },
        change_rule_name: function (rule, new_id) {
            //TODO Check id is unique
            rule.id = new_id;
        },
        edit_rule: function (rule_id, code, xml_blocks) {
            var graph_node = n.node_list[CyA.current_node.id()];
            if (graph_node) {
                for (var i = 0; i < graph_node.rules.length; ++i) {
                    var current_rule = graph_node.rules[i];
                    if (current_rule.id === rule_id) {
                        current_rule.code = code;
                        current_rule.blocks = xml_blocks;
                    }
                }
            }
        },
        delete_rule: function (rule_id) {
            var graph_node = n.node_list[CyA.current_node];
            if (graph_node) {
                for (var i = 0; i < graph_node.rules.length; ++i) {
                    var current_rule = graph_node.rules[i];
                    if (current_rule.id === rule_id) {
                        graph_node.rules.splice(i, 1);
                    }
                }
            }
        },
        node_overlaps: function (x, y, id) {
            for (var node in n.node_list) {
                node = n.node_list[node];
                if (node.x === x && node.y === y && id !== node.id) {
                    return true;
                }
            }
            return false;
        },
        add: function (cy_node) {
            var x = cy_node.position().x;
            var y = cy_node.position().y;
            var id = cy_node.id();
            if (n.node_overlaps(x, y, id)) {
                return false;
            }
            n.node_number++;
            cy_node.variables = {};
            cy_node.rules = {};
            n.node_list[id] = cy_node;
            return true;
        },
        update_position: function (node) {
            var graph_node = n.node_list[node.id()];
            if (n.node_overlaps(node.position().x, node.position().y, node.id())) {
                node.position().x = graph_node.x;
                node.position().y = graph_node.y;
            } else {
                graph_node.x = node.position().x;
                graph_node.y = node.position().y;
            }
        }
    },
    //Manages the current list of resources in the system
    //Tags must be unique and can only be declared in the graph sidebar
    resources: {
        resource_list: [],
        exists: function (resource_name) {
            var i = r.resource_list.indexOf(resource_name);
            return i == -1 ? null : t.resource_list[i];
        },
        //Returns false if a tag with the given name already exists
        //Tags are pairs of a name and an element corresponding to the element in the graph sidebar
        update: function (element_id, resource_name) {
            if (r.exists(resource_name)) {
                if (resource_name === element_id) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if (resource_name !== "") {
                    r.resource_list.push(resource_name);
                }
                r.resource_list.splice(r.resource_list.indexOf(element_id), 1);
                return true;
            }
        },
        //Returns false if no tag found
        //Otherwise removes the tag and returns true
        remove: function (resource_name) {
            var resource = r.exists(resource_name);
            if (resource) {
                r.resource_list.splice(r.resource_list.indexOf(resource), 1);
                return true;
            }
            return false;
        },
    },

    getAsJSON: function () {
        return {
            nodes: nodes,
            edges: edges
        }
    },
    evaluator: {
        internal_rules: [],
        source_rules: [],
        sink_rules: [],
        evaluate: function () {
            var i;
            for(i = 0; i < Graph.evaluator.internal_rules.length; ++i){
                Graph.evaluator.internal_rules[i].run();
            }
            for(i = 0; i < Graph.evaluator.source_rules.length; ++i){
                Graph.evaluator.source_rules[i].run();
            }
            for(i = 0; i < Graph.evaluator.sink_rules.length; ++i){
                Graph.evaluator.sink_rules[i].run();
            }
        }
    }
};

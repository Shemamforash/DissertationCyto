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
        create_rules: function (rules) {
            var graph_node = CyA.current_node;
            if (graph_node) {
                graph_node.rules = [];
                for (var i = 0; i < rules.length; ++i) {
                    var new_rule = null;
                    new_rule = {
                        rule_text: rules[i].rule_text,
                        code: rules[i].code,
                        rule_type: rules[i].rule_type,
                        layer: rules[i].layer
                    };
                    graph_node.rules.push(new_rule);
                }
            }
        },
        get_rules_as_string: function () {
            var existing_rules = CyA.current_node.rules;
            var rule_string = "";
            for (var i = 0; i < existing_rules.length; ++i) {
                rule_string += existing_rules[i].rule_text + "\n";
            }
            return rule_string;
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
            cy_node.rules = [];
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
    getAsJSON: function () {
        return {
            nodes: nodes,
            edges: edges
        }
    },
    reset_simulation: function () {
        environment.reset_variables();
        for (var node in n.node_list) {
            node = n.node_list[node];
            node.variables = [];
            console.log(node);
            for (var i = 0; i < node.rules.length; ++i) {
                console.log(node.rules[i]);
                if (node.rules[i].rule_type === "INTERNAL VAR") {
                    eval(node.rules[i].code);
                }
            }
            for(var variable in n.variables){
                variable.watch("current_value", function () {
                    if (this.max_value !== undefined && this.current_value > this.max_value) {
                        this.current_value = this.max_value;
                    } else if (this.min_value !== undefined && this.current_value < this.min_value) {
                        this.current_value = this.max_value;
                    }
                });
            }
        }
    },
    evaluate: function () {
        var i;
        var internal_rules = [], source_rules = [], sink_rules = [];
        for (var node in n.node_list) {
            node = n.node_list[node];
            for (i = 0; i < node.variables.length; ++i) {
                var reset_value = node.variables[i].reset_value;
                if (reset_value !== undefined) {
                    node.variables[i].current_value = reset_value;
                }
            }
            for (i = 0; i < node.rules.length; ++i) {
                switch (node.rules[i].rule_type) {
                    case "INTERNAL VAR":
                        break;
                    case "INTERNAL":
                        internal_rules.push(node.rules[i]);
                        break;
                    case "SOURCE":
                        source_rules.push(node.rules[i]);
                        break;
                    case "SINK":
                        sink_rules.push(node.rules[i]);
                        break;
                    default:
                        console.log("invalid rule type " + node.rules[i].rule_type);
                        break;
                }
            }
        }

        function compare(a,b) {
            return a.layer - b.layer;
        }

        source_rules.sort(compare);
        sink_rules.sort(compare);

        for (i = 0; i < internal_rules.length; ++i) {
            eval(internal_rules[i].code);
        }
        for (i = 0; i < source_rules.length; ++i) {
            eval(source_rules[i].code);
        }
        for (i = 0; i < sink_rules.length; ++i) {
            eval(sink_rules[i].code);
        }
    }
};

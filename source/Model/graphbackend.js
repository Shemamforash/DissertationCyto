/**
 * Created by Sam on 20/01/2017.
 */
var Graph = (function () {
    var edges = [];
    var nodes = {};
    var node_number = 0;
    var resources = {};

    function prims(resource_name){
        var node, wanted_nodes = [], path = [];
        CytoGraph.get_cy().elements().removeClass("highlighted");

        if(resource_name !== null) {
            for (node in nodes) {
                node = nodes[node];
                if (node.resource_tags.indexOf(resource_name) !== -1) {
                    node.addClass("highlighted");
                    wanted_nodes.push(node);
                }
            }

            for (var i = 0; i < wanted_nodes.length; ++i) {
                node = wanted_nodes[i];
                var dijkstra_result = CytoGraph.get_cy().elements().dijkstra(node);
                for (var j = 0; j < wanted_nodes.length; ++j) {
                    if (j !== i) {
                        // arr_union(dijkstra_result.pathTo(wanted_nodes[j]));
                        dijkstra_result.pathTo(wanted_nodes[j]).addClass("highlighted");
                    }
                }
            }
        }
    }

    function add_edge(edge) {
        var source = edge.source().id();
        var target = edge.target().id();
        console.log("Desired edge: " + source + " ::::: " + target);
        for (var i = 0; i < edges.length; ++i) {
            var existing_edge = edges[i];
            var edge_source = existing_edge.source().id();
            var edge_target = existing_edge.target().id()
            console.log("Existing edge: " + edge_source + " ::::: " + edge_target);
            if ((edge_source === source && edge_target === target) || (edge_target === source && edge_source === target)) {
                console.log("exists");
                return false;
            }
            console.log("     ");
        }
        edges.push(edge);
        return true;
    }

    function create_rules(rules) {
        var graph_node = CytoGraph.get_current_node();
        if(rules) {
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
        }
    }

    function get_rules_as_string() {
        var existing_rules = CytoGraph.get_current_node().rules;
        var rule_string = "";
        for (var i = 0; i < existing_rules.length; ++i) {
            rule_string += existing_rules[i].rule_text + "\n";
        }
        return rule_string;
    }

    function node_overlaps(x, y, id) {
        for (var node in nodes) {
            node = nodes[node];
            if (node.x === x && node.y === y && id !== node.id) {
                return true;
            }
        }
        return false;
    }

    function add_node(cy_node) {
        var x = cy_node.position().x;
        var y = cy_node.position().y;
        var id = cy_node.id();
        if (node_overlaps(x, y, id)) {
            return false;
        }
        node_number++;
        nodes[id] = cy_node;
        return true;
    }

    function update_position(node) {
        var graph_node = nodes[node.id()];
        if (node_overlaps(node.position().x, node.position().y, node.id())) {
            node.position().x = graph_node.x;
            node.position().y = graph_node.y;
        } else {
            graph_node.x = node.position().x;
            graph_node.y = node.position().y;
        }
    }

    function reset_simulation() {
        reset_variables();
        for (var node in nodes) {
            node = nodes[node];
            node.variables = {};
            node.resource_tags = [];
            for (var i = 0; i < node.rules.length; ++i) {
                if (node.rules[i].rule_type === "INTERNAL VAR") {
                    eval(node.rules[i].code);
                }
            }
        }
    }

    function evaluate() {
        var i;
        var internal_rules = [], source_rules = [], sink_rules = [];
        for (var node in nodes) {
            node = nodes[node];
            for (var variable in node.variables) {
                variable = node.variables[variable];
                var reset_value = variable.reset_value;
                if (reset_value !== undefined) {
                    variable.current_value = reset_value;
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
                for (var variable in node.variables) {
                    variable = node.variables[variable];
                    if (variable.max_value !== undefined && variable.current_value > variable.max_value) {
                        variable.current_value = variable.max_value;
                    } else if (variable.min_value !== undefined && variable.current_value < variable.min_value) {
                        variable.current_value = variable.max_value;
                    }
                }
            }
        }

        function compare(a, b) {
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

    function create_resource(name, node) {
        if (node.resource_tags.indexOf(name) === -1) {
            node.resource_tags.push(name);
        }
        if (!resources.hasOwnProperty(name)) {
            resources[name] = {
                name: name,
                value: 0,
                increment: function (amnt) {
                    this.value += amnt;
                },
                decrement: function (amnt) {
                    this.value -= amnt;
                }
            };
        }
        return resources[name];
    }

    function reset_variables() {
        resources = {};
    }

    function increase_node_number() {
        ++node_number;
    }

    function get_nodes() {
        return nodes;
    }

    function get_resources() {
        return resources;
    }

    function get_node_number() {
        return node_number;
    }

    function remove_node(node){
        for(var i = 0; i < edges.length; ++i){
            if(edges[i].source().id() === node.id() || edges[i].target().id() === node.id()){
                edges.splice(i, 1);
                break;
            }
        }
        console.log(nodes);
        console.log(node);
        delete nodes[node.id()];
        console.log(nodes);
        console.log(node);
    }

    function clear(){
        edges = [];
        nodes = {};
        resources = {};
        node_number = 0;
    }

    return {
        remove_node: remove_node,
        clear: clear,
        prims: prims,
        add_edge: add_edge,
        create_rules: create_rules,
        get_rules_as_string: get_rules_as_string,
        node_overlaps: node_overlaps,
        add_node: add_node,
        update_position: update_position,
        reset_simulation: reset_simulation,
        evaluate: evaluate,
        create_resource: create_resource,
        reset_variables: reset_variables,
        increase_node_number: increase_node_number,
        get_nodes: get_nodes,
        get_resources: get_resources,
        get_node_number: get_node_number
    };
});

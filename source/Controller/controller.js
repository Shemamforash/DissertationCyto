/**
 * Created by Sam on 26/01/2017.
 */

//For external reading https://jsfiddle.net/Ln37kqc0/

$(document).ready(function () {
    Evaluator = Evaluator();
    Behaviour = Behaviour();
    Graph = Graph();
    CytoGraph = CytoGraph();
    CytoGraph.init();
});

$(window).on("beforeunload", save);

function save() {
    var saved_nodes = get_nodes_to_save();
    localStorage.previous_graph = JSON.stringify(CytoGraph.get_cy().json());
    localStorage.nodes = JSON.stringify(saved_nodes);
}

function get_nodes_to_save() {
    var saved_nodes = [], node, existing_nodes = Graph.get_nodes();
    for (node in existing_nodes) {
        node = existing_nodes[node];
        saved_nodes.push({
            variables: node.variables,
            rules: node.rules,
            id: node.id()
        });
    }
    return saved_nodes;
}

// INTERNAL VAR ctr = 2;
// INTERNAL ctr = if ctr < 10 then ctr + 1 else ctr + 10 endif;
// SOURCE 0 beans : ctr;

function load_graph(existing_cy) {
    var cy = cytoscape({
        container: document.getElementById('cy_div'),
        elements: [],
        layout: {name: 'circle'},
        style: [{
            selector: 'node',
            style: {
                'shape': 'rectangle',
                'label': 'data(label)'
            },
        }]
    });
    if (existing_cy) {
        cy.json(JSON.parse(existing_cy));
    } else if (localStorage.previous_graph !== undefined && localStorage.previous_graph !== "undefined") {
        cy.json(JSON.parse(localStorage.previous_graph));
    }
    cy.style().selector('edge.highlighted').style({'line-color': 'cyan'});
    cy.style().selector('node.highlighted').style({'border-color': 'cyan', 'border-width': '5'});
    cy.minZoom(0.5);
    cy.maxZoom(3);
    cy.snapToGrid({
        gridSpacing: 80,
        snapToGrid: true
    });
    CytoGraph.set_cy(cy);
}

function load_nodes(saved_nodes) {
    var stored_nodes = null, existing_nodes, i, graph_node, rule_node;
    if (saved_nodes) {
        stored_nodes = JSON.parse(saved_nodes);
    } else if (localStorage.nodes !== undefined && localStorage.nodes !== "undefined") {
        stored_nodes = JSON.parse(localStorage.nodes);
    }
    if (stored_nodes !== null) {
        existing_nodes = CytoGraph.get_cy().elements().nodes();
        for (i = 0; i < existing_nodes.length; ++i) {
            Graph.increase_node_number();
            graph_node = existing_nodes[i];
            for (var j = 0; j < stored_nodes.length; ++j) {
                rule_node = stored_nodes[j];
                if (rule_node.id === graph_node.id()) {
                    graph_node.variables = rule_node.variables;
                    for (var variable in graph_node.variables) {
                        variable = graph_node.variables[variable];
                        variable.current_value = variable.initial_value;
                    }
                    graph_node.rules = rule_node.rules;
                    graph_node.resource_tags = [];
                    Graph.add_node(graph_node);
                }
            }
        }
    }
}
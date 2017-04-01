/**
 * Created by Sam on 26/01/2017.
 */

//For external reading https://jsfiddle.net/Ln37kqc0/

$(document).ready(function () {
    Evaluator = Evaluator();
    Behaviour = Behaviour();
    Graph = Graph();
    CytoGraph = CytoGraph();
});

$(window).on("beforeunload", save);

function save() {
    var saved_nodes = [], node, existing_nodes = Graph.get_nodes();
    localStorage.previous_graph = JSON.stringify(CytoGraph.get_cy().json());
    for (node in existing_nodes) {
        node = existing_nodes[node];
        console.log(node.variables["ctr"]);
        console.log(node.rules);
        console.log(node.variables);
        saved_nodes.push({
            variables: node.variables,
            rules: node.rules,
            id: node.id()
        });
    }
    localStorage.nodes = JSON.stringify(saved_nodes);
    localStorage.resources = JSON.stringify(Graph.resources);
}

function load_graph(){
    var cy = cytoscape({
        container: document.getElementById('cy_div'),
        elements: [],
        layout: {name: 'circle'},
        style: [{
            selector: 'node',
            style: {
                'shape': 'rectangle',
                'label': 'data(label)'
            }
        }]
    });
    cy.minZoom(0.5);
    cy.maxZoom(3);
    cy.snapToGrid({
        gridSpacing: 80,
        snapToGrid: true
    });
    if(localStorage.previous_graph !== undefined && localStorage.previous_graph !== "undefined"){
        cy.json(JSON.parse(localStorage.previous_graph));
    }
    return cy;
}

// INTERNAL VAR ctr = 2;
// INTERNAL ctr = if ctr < 10 then ctr + 1 else ctr + 10 endif;
// SOURCE 0 beans : ctr;

function load_nodes(cy){
    var stored_nodes, existing_nodes, i, graph_node, rule_node;
    if(localStorage.nodes !== undefined  && localStorage.nodes !== "undefined"){
        stored_nodes = JSON.parse(localStorage.nodes);
        existing_nodes = cy.elements().nodes();
        for(i = 0; i < existing_nodes.length; ++i){
            Graph.increase_node_number();
            graph_node = existing_nodes[i];
            for(var j = 0; j < stored_nodes.length; ++j){
                rule_node = stored_nodes[j];
                if(rule_node.id === graph_node.id()){
                    console.log(rule_node.variables);
                    graph_node.variables = rule_node.variables;
                    for(var variable in graph_node.variables){
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

function load_resources(){
    if(localStorage.resources !== undefined && localStorage.resources !== "undefined"){
        return JSON.parse(localStorage.resources);
    }
    return [];
}
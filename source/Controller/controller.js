/**
 * Created by Sam on 26/01/2017.
 */

$(document).ready(function () {
    Behaviour.init();
    Graph.init();
    Evaluator.init();
    CytoGraph.init();
});

$(window).on("beforeunload", save);

function save() {
    localStorage.previous_graph = JSON.stringify(cy.json());
    console.log(n.node_list);
    var saved_nodes = [];
    for (var node in n.node_list) {
        node = n.node_list[node];
        saved_nodes.push({
            variables: node.variables,
            rules: node.rules,
            id: node.id()
        });
    }
    localStorage.nodes = JSON.stringify(saved_nodes);
    localStorage.resources = JSON.stringify(environment.resources);
}

function load() {
    if (localStorage.previous_graph !== undefined) {
        var node_list = JSON.parse(localStorage.nodes);
        environment.resources = JSON.parse(localStorage.resources);
        return {cy: JSON.parse(localStorage.previous_graph), nodes: node_list};
    }
    return false;
}
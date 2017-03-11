/**
 * Created by Sam on 26/01/2017.
 */
var Controller = {
    save: function () {
        localStorage.setItem('lastGraph', JSON.stringify(graph.getAsJSON()));
    },

    load: function () {
        var graphObject = JSON.parse(localStorage.getItem('lastGraph'));
        graph.nodes = graphObject.nodes;
        graph.edges = graphObject.edges;
        var i;
        for (i = 0; i < graph.edges; ++i) {
            cy.add({
                group: "edges",
                data: {
                    source: CyA.current_node_element.get().id(),
                    target: target.id()
                }
            });
        }
    }
};

$(document).ready(function(){
    CytoGraph.init();
    Behaviour.init();
    Graph.init();
    Evaluator.init();
});
/**
 * Created by Sam on 20/01/2017.
 */
var cy;
var currentNode = null;

window.onload = function () {
    cy = cytoscape({
        container: document.getElementById('cy_div'),
        layout: {name: 'circle'},
        style: [{
            selector: 'node',
            style: {
                'shape': 'rectangle'
            }
        }]
    });
    cy.minZoom(0.5);
    cy.maxZoom(3);

    cy.on('tap', function(event){
        var target = event.cyTarget;
        if(target === cy) {
            currentNode = null;
        } else {
            currentNode = target;
        }
    });

    cy.on('cxttap', 'node', function(event){
        if(currentNode) {
            if(graph.add_edge(currentNode.id(), event.cyTarget.id())) {
                cy.add({
                    group: "edges",
                    data: {
                        source: currentNode.id(),
                        target: event.cyTarget.id()
                    }
                });
                console.log("added");
                currentNode = null;
            }
        }
    });
    
    cy.on('tapend', 'node', function(event){
        var node = event.cyTarget;
        var snap_position = snapToLines(node.position().x, node.position().y);
        node.position().x = snap_position.x;
        node.position().y = snap_position.y;
        graph.update_node(node);
    });
};

function addNode(event) {
    var snap_position = snapToLines(event.x, event.y);
    var new_node = cy.add({
        group: "nodes",
        data: {weight: 75},
        position: {x: snap_position.x, y: snap_position.y}
    });
    graph.add_node(new_node.id(), snap_position.x, snap_position.y);
}

function clampViewPort() {
    var viewport = cy.extent();
    var bound = cy.elements().boundingBox();

    var outOfBounds = viewport.x1 > bound.x2 || viewport.y1 > bound.y2 || bound.x1 > viewport.x2 || bound.y1 > viewport.y2;
    if (outOfBounds) {
        cy.animate({
            center: cy.elements()
        }, {
            duration: 1000,
            easing: "spring(500, 20)"
        });
    }
}

function snapToLines(x, y) {
    var zoom = cy.zoom();
    var distance = 80;
    x = x / zoom + cy.extent().x1;
    y = y / zoom + cy.extent().y1;
    x = Math.round(x / distance) * distance;
    y = Math.round(y / distance) * distance;
    return {
        x: x,
        y: y
    };
}
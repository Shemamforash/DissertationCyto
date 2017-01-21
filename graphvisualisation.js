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
                'shape': 'rectangle',
                'label': 'data(label)'
            }
        }]
    });
    cy.minZoom(0.5);
    cy.maxZoom(3);

    cy.on('tapstart', function(event){
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
            }
        }
    });
    
    cy.on('tapend', function(event){
        if(currentNode !== null) {
            currentNode.align("top", "left");
            graph.update_node(currentNode);
            currentNode.align("top", "left");
        }
    });

    cy.gridGuide({
        snapToGrid: true,
        drawGrid: true,
        gridSpacing: 80,
        strokeStyle: '#dbad78'
    });
};

function addNode(event) {
    var snap_position = mouseToWorldCoordinates(event.x, event.y);
    var new_node = cy.add({
        group: "nodes",
        data: {label: "new node"},
        position: {x: snap_position.x, y: snap_position.y},
    });

    new_node.align("top", "left");

    if(!graph.add_node(new_node.id(), new_node.position().x, new_node.position().y)) {
        cy.remove(new_node);
    }
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

function mouseToWorldCoordinates(x, y) {
    var zoom = cy.zoom();
    x = x / zoom + cy.extent().x1;
    y = y / zoom + cy.extent().y1;
    return {
        x: x,
        y: y
    };
}
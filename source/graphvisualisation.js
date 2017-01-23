/**
 * Created by Sam on 20/01/2017.
 */
var cy;

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

    //start click
    cy.on('tapstart', function (event) {
        var target = event.cyTarget;
        if (target === cy) {
            currentNode.get(null);
        } else {
            currentNode.set(target);
        }
    });

    //end click
    cy.on('tapend', function (event) {
        if (currentNode.get()) {
            graph.update_node_position(currentNode.get());
        }
        if(event.cyTarget !== currentNode.get()){
            toggleNodeSidebar(false);
        } else {
            cy.nodes().deselect();
            event.cyTarget.select();
            toggleNodeSidebar(true);
        }
    });

    //right click
    cy.on('cxttap', 'node', function (event) {
        var target = event.cyTarget;
        if (currentNode.get()) {
            if (target !== currentNode.get()) {
                toggleNodeSidebar(true);
                if (graph.add_edge(currentNode.get().id(), target.id())) {
                    cy.add({
                        group: "edges",
                        data: {
                            source: currentNode.get().id(),
                            target: target.id()
                        }
                    });
                }
            }
        }
    });

    cy.snapToGrid({
        gridSpacing: 80,
        snapToGrid: true
    });
};

var currentNode = (function(){
    var node = null;
    return {
        set : function(val){
            node = val;
        },
        get : function(){
            return node;
        }
    }
}());

function addNode(event) {
    var snap_position = mouseToWorldCoordinates(event.x, event.y);
    var new_node = cy.add({
        group: "nodes",
        data: {label: "new node"},
        position: {x: snap_position.x, y: snap_position.y},
    });
    if (!graph.add_node(new_node.id(), new_node.position().x, new_node.position().y)) {
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
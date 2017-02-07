/**
 * Created by Sam on 20/01/2017.
 */

var cy, CyA, CyB, CytoGraph = {
    attributes: {
        current_node: null
    },
    behaviour: {
        select_node: function (event) {
            var target = event.cyTarget;
            if (target !== cy) {
                CyA.current_node = target;
            }
        },
        change_or_move_node: function (event) {
            if (CyA.current_node) {
                Graph.nodes.update_position(CyA.current_node);
            }
            if(event.cyTarget !== CyA.current_node){
                Behaviour.toggleNodeSidebar(false);
            } else {
                cy.nodes().deselect();
                event.cyTarget.select();
                Behaviour.toggleNodeSidebar(true);
            }
        },
        link_nodes: function (event) {
            var target = event.cyTarget;
            if (CyA.current_node) {
                if (target !== CyA.current_node) {
                    Behaviour.toggleNodeSidebar(true);
                    if (Graph.edges.add(CyA.current_node.id(), target.id())) {
                        cy.add({
                            group: "edges",
                            data: {
                                source: CyA.current_node.id(),
                                target: target.id()
                            }
                        });
                    }
                }
            }
        }
    },
    init: function(){
        CyA = CytoGraph.attributes;
        CyB = CytoGraph.behaviour;
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
        cy.snapToGrid({
            gridSpacing: 80,
            snapToGrid: true
        });
        CytoGraph.bind();
    },
    bind: function(){
        //start click
        cy.on('tapstart', CyB.select_node);
        //end click
        cy.on('tapend', CyB.change_or_move_node);
        //right click
        cy.on('cxttap', 'node', CyB.link_nodes);
    },
    add_node: function(event){
        var snap_position = CytoGraph.mouse_to_world_coordinates(event.x, event.y);
        var new_node = cy.add({
            group: "nodes",
            data: {label: "new node"},
            position: {x: snap_position.x, y: snap_position.y}
        });
        if (!Graph.nodes.add(new_node.id(), new_node.position().x, new_node.position().y)) {
            cy.remove(new_node);
        }
    },
    clamp_viewport: function(){
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
    },
    mouse_to_world_coordinates: function(x, y){
        var zoom = cy.zoom();
        x = x / zoom + cy.extent().x1;
        y = y / zoom + cy.extent().y1;
        return {
            x: x,
            y: y
        };
    }
};
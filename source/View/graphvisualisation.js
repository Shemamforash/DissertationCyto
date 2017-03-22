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
                CyA.current_node = n.node_list[target.id()];
                Behaviour.update_node_sidebar();
            }
        },
        change_or_move_node: function (event) {
            if (CyA.current_node) {
                Graph.nodes.update_position(CyA.current_node);
            }
            if (event.cyTarget === cy || event.cyTarget.group() !== "nodes") {
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
                    var new_edge = cy.add({
                        group: "edges",
                        data: {
                            source: CyA.current_node.id(),
                            target: target.id()
                        }
                    });
                    if (!Graph.edges.add(new_edge)) {
                        cy.remove(new_edge);
                    }
                }
            }
        }
    },
    init: function () {
        var cyjson = load();
        CyA = CytoGraph.attributes;
        CyB = CytoGraph.behaviour;
        cy = cytoscape({
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
        if (cyjson !== false) {
            cy.json(cyjson.cy);
            n.node_number = cy.elements().nodes().length;
            for(var i = 0; i < cy.elements().nodes().length; ++i){
                var new_node = cy.elements().nodes()[i];
                if(Graph.nodes.add(new_node)){
                    for(var i = 0; i < cyjson.nodes.length; ++i){
                        if(cyjson.nodes[i].id === new_node.id()){
                            new_node.variables = cyjson.nodes[i].variables;
                            new_node.rules = cyjson.nodes[i].rules;
                        }
                    }
                }
            }
        }

        CytoGraph.bind();
    },
    bind: function () {
        //start click
        cy.on('tapstart', CyB.select_node);
        //end click
        cy.on('tapend', CyB.change_or_move_node);
        //right click
        cy.on('cxttap', 'node', CyB.link_nodes);
    },
    add_node: function (event) {
        var snap_position = CytoGraph.mouse_to_world_coordinates(event.x, event.y);
        var new_node = cy.add({
            group: "nodes",
            data: {
                label: "Node" + n.node_number,
                id: "Node" + n.node_number
            },
            position: {x: snap_position.x, y: snap_position.y}
        });
        if (!Graph.nodes.add(new_node)) {
            cy.remove(new_node);
        }
    },
    clamp_viewport: function () {
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
    mouse_to_world_coordinates: function (x, y) {
        var zoom = cy.zoom();
        x = x / zoom + cy.extent().x1;
        y = y / zoom + cy.extent().y1;
        return {
            x: x,
            y: y
        };
    }
};
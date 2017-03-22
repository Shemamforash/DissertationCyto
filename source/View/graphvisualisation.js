/**
 * Created by Sam on 20/01/2017.
 */

var CytoGraph = (function () {
    var current_node = null;
    var cy = {};
    var behaviour = {
        select_node: function (event) {
            var target = event.cyTarget;
            if (target !== cy) {
                current_node = Graph.nodes[target.id()];
                Behaviour.update_node_sidebar();
            }
        },
        change_or_move_node: function (event) {
            if (current_node) {
                Graph.nodes.update_position(current_node);
            }
            if (event.cyTarget === cy || event.cyTarget.group() !== "nodes") {
                Behaviour.toggle_node_sidebar(false);
            } else {
                cy.nodes().deselect();
                event.cyTarget.select();
                Behaviour.toggle_node_sidebar(true);
            }
        },
        link_nodes: function (event) {
            var target = event.cyTarget;
            if (current_node) {
                if (target !== current_node) {
                    Behaviour.toggle_node_sidebar(true);
                    var new_edge = cy.add({
                        group: "edges",
                        data: {
                            source: current_node.id(),
                            target: target.id()
                        }
                    });
                    if (!Graph.edges.add(new_edge)) {
                        cy.remove(new_edge);
                    }
                }
            }
        }
    };
    init();
    function init() {
        var cyjson = load();
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
            Graph.node_number = cy.elements().nodes().length;
            for (var i = 0; i < cy.elements().nodes().length; ++i) {
                var new_node = cy.elements().nodes()[i];
                if (Graph.add_node(new_node)) {
                    for (var i = 0; i < cyjson.nodes.length; ++i) {
                        if (cyjson.nodes[i].id === new_node.id()) {
                            new_node.variables = cyjson.nodes[i].variables;
                            new_node.rules = cyjson.nodes[i].rules;
                        }
                    }
                }
            }
        }

        bind();
    }

    function bind() {
        //start click
        cy.on('tapstart', behaviour.select_node);
        //end click
        cy.on('tapend', behaviour.change_or_move_node);
        //right click
        cy.on('cxttap', 'node', behaviour.link_nodes);
    }

    function mouse_to_world_coordinates(x, y) {
        var zoom = cy.zoom();
        x = x / zoom + cy.extent().x1;
        y = y / zoom + cy.extent().y1;
        return {
            x: x,
            y: y
        };
    }

    return {
        behaviour: behaviour,
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
            if (!Graph.add_node(new_node)) {
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
        }
    };
});
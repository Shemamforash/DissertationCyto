/**
 * Created by Sam on 20/01/2017.
 */

var CytoGraph = function () {
    var current_node = null;
    var cy = {};


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
        reset_current_node: function(){
            current_node = null;
        },
        init: function () {
            load_graph();
            load_nodes();
        },
        bind: function () {
            //start click
            cy.on('tapstart', CytoGraph.select_node);
            //end click
            cy.on('tapend', CytoGraph.change_or_move_node);
            //right click
            cy.on('cxttap', 'node', CytoGraph.link_nodes);
        },
        set_cy: function (new_cy) {
            cy = new_cy;
            CytoGraph.bind();
        },
        select_node: function (event) {
            var target = event.cyTarget;
            console.log(target);
            if (target !== cy && target.group() === "nodes") {
                current_node = Graph.get_nodes()[target.id()];
                Behaviour.update_node_sidebar();
            } else {
                Behaviour.toggle_graph_sidebar(false);
            }
        },
        change_or_move_node: function (event) {
            if (current_node) {
                Graph.update_position(current_node);
            }
            if (event.cyTarget === cy || event.cyTarget.group() === "edges") {
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
                    if (!Graph.add_edge(new_edge)) {
                        cy.remove(new_edge);
                    }
                }
            }
        },
        add_node: function (event) {
            var snap_position = mouse_to_world_coordinates(event.x, event.y);
            var new_node = cy.add({
                group: "nodes",
                data: {
                    label: "Node" + Graph.get_node_number(),
                    id: "Node" + Graph.get_node_number()
                },
                position: {x: snap_position.x, y: snap_position.y}
            });
            new_node.variables = {};
            new_node.rules = [];
            new_node.resource_tags = [];
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
        },
        get_cy: function () {
            return cy;
        },
        get_current_node: function () {
            return current_node;
        }
    };
};